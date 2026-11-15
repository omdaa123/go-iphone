import { Router } from "express";
import { z } from "zod";
import { pool } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { requirePermission } from "../middleware/rbac.js";
import { validateBody } from "../middleware/validate.js";
import { logAudit } from "../lib/audit.js";

export const customersRouter = Router();
customersRouter.use(requireAuth, requirePermission("orders.write"));

const customerKeySql = "COALESCE(NULLIF(lower(email), ''), regexp_replace(COALESCE(phone, ''), '[^0-9]', '', 'g'))";

customersRouter.get("/", async (req, res, next) => {
  try {
    const { rows } = await pool.query(`
      WITH activity AS (
        SELECT ${customerKeySql} AS customer_key, customer_name AS name, phone, email, address, city, created_at,
               'order'::text AS activity_type, CASE WHEN status <> 'Cancelled' THEN total_cents ELSE 0 END AS amount_cents
        FROM orders
        UNION ALL
        SELECT ${customerKeySql} AS customer_key, customer_name AS name, phone, email, NULL::text AS address, NULL::text AS city,
               created_at, 'reservation'::text AS activity_type, 0::bigint AS amount_cents
        FROM reservations
      ), grouped AS (
        SELECT customer_key AS id, MAX(name) AS name, MAX(phone) AS phone, MAX(email) AS email,
               MAX(address) AS address, MAX(city) AS city, MIN(created_at) AS first_activity, MAX(created_at) AS last_activity,
               COUNT(*) FILTER (WHERE activity_type='order')::int AS orders_count,
               COUNT(*) FILTER (WHERE activity_type='reservation')::int AS reservations_count,
               COALESCE(SUM(amount_cents) FILTER (WHERE activity_type='order'),0)::bigint AS total_spent_cents
        FROM activity WHERE customer_key <> '' GROUP BY customer_key
      )
      SELECT g.*, COALESCE(cp.notes,'') AS notes, COALESCE(cp.tags,'[]'::jsonb) AS tags,
             COALESCE(cp.segment,'Regular') AS segment, cp.updated_at AS profile_updated_at
      FROM grouped g LEFT JOIN customer_profiles cp ON cp.customer_key=g.id
      ORDER BY g.last_activity DESC LIMIT 1000
    `);
    res.json({ customers: rows });
  } catch (err) { next(err); }
});

customersRouter.get("/:customerKey", async (req, res, next) => {
  try {
    const key=req.params.customerKey;
    const orders=await pool.query(`
      SELECT o.*, COALESCE(json_agg(json_build_object('id',oi.id,'productName',p.name,'variant_label',oi.variant_label,'qty',oi.qty,'unit_price_cents',oi.unit_price_cents))
      FILTER (WHERE oi.id IS NOT NULL),'[]') AS items
      FROM orders o LEFT JOIN order_items oi ON oi.order_id=o.id LEFT JOIN products p ON p.id=oi.product_id
      WHERE ${customerKeySql.replaceAll("email","o.email").replaceAll("phone","o.phone")}=$1
      GROUP BY o.id ORDER BY o.created_at DESC LIMIT 100
    `,[key]);
    const reservations=await pool.query(`
      SELECT r.*,p.name AS product_name FROM reservations r JOIN products p ON p.id=r.product_id
      WHERE ${customerKeySql.replaceAll("email","r.email").replaceAll("phone","r.phone")}=$1
      ORDER BY r.created_at DESC LIMIT 100
    `,[key]);
    const profile=await pool.query("SELECT notes,tags,segment,updated_at FROM customer_profiles WHERE customer_key=$1",[key]);
    res.json({orders:orders.rows,reservations:reservations.rows,profile:profile.rows[0]||null});
  } catch(err){next(err);}
});

const profileSchema=z.object({
  notes:z.string().max(5000).optional().default(""),
  tags:z.array(z.string().trim().min(1).max(32)).max(12).optional().default([]),
  segment:z.enum(["Regular","VIP","Wholesale","At Risk","New"]).optional().default("Regular")
});
customersRouter.patch("/:customerKey/profile",validateBody(profileSchema),async(req,res,next)=>{
  try{
    const key=req.params.customerKey;
    const {rows}=await pool.query(`
      INSERT INTO customer_profiles(customer_key,notes,tags,segment,updated_at)
      VALUES($1,$2,$3::jsonb,$4,now())
      ON CONFLICT(customer_key) DO UPDATE SET notes=EXCLUDED.notes,tags=EXCLUDED.tags,segment=EXCLUDED.segment,updated_at=now()
      RETURNING notes,tags,segment,updated_at
    `,[key,req.body.notes,JSON.stringify(req.body.tags),req.body.segment]);
    await logAudit({adminUserId:req.admin.id,action:"customer.profile_update",resourceType:"customer",resourceId:key,after:rows[0],ip:req.ip});
    res.json({customer:{id:key,...rows[0]}});
  }catch(err){next(err);}
});
