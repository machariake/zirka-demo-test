import type { CollectionConfig, PayloadRequest } from "payload";
import { APIError } from "payload";
import { canCreateUsers, canDeleteUsers, canReadUsers, canSetRole, canUpdateUsers, hiddenUnlessSuperAdmin } from "../access";

const countSuperAdmins = async (req: PayloadRequest): Promise<number> => {
  const { totalDocs } = await req.payload.find({
    collection: "users",
    limit: 0,
    depth: 0,
    where: { role: { equals: "superadmin" } },
  });
  return totalDocs;
};

export const Users: CollectionConfig = {
  slug: "users",
  auth: true,
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "email", "role"],
    group: "Setup",
    hidden: hiddenUnlessSuperAdmin,
  },
  access: {
    read: canReadUsers,
    create: canCreateUsers,
    update: canUpdateUsers,
    delete: canDeleteUsers,
    admin: ({ req }) => Boolean(req.user),
  },
  hooks: {
    beforeChange: [
      // An admin may only ever create or keep workers. Without this an admin
      // could promote themselves, or make another admin, through the API.
      async ({ req, originalDoc, data, operation }) => {
        if ((req.user as { role?: string } | null)?.role === "admin") {
          const target = data.role ?? originalDoc?.role;
          if (target !== "worker") {
            throw new APIError("Admins can only create and manage Worker accounts.", 403);
          }
          if (operation === "update" && originalDoc?.role && originalDoc.role !== "worker") {
            throw new APIError("Admins cannot change an Admin or Super Admin account.", 403);
          }
        }
        return data;
      },
      // Without this, the last super admin can lock everyone out of the admin
      // by demoting or deleting their own account.
      async ({ req, originalDoc, data, operation }) => {
        if (operation !== "update") return data;
        const wasSuper = originalDoc?.role === "superadmin";
        const stillSuper = (data.role ?? originalDoc?.role) === "superadmin";
        if (wasSuper && !stillSuper && (await countSuperAdmins(req)) <= 1) {
          throw new APIError(
            "This is the only super admin. Promote someone else before changing this role.",
            400
          );
        }
        return data;
      },
    ],
    beforeDelete: [
      async ({ req, id }) => {
        const doc = await req.payload.findByID({ collection: "users", id, depth: 0 });
        if (doc?.role === "superadmin" && (await countSuperAdmins(req)) <= 1) {
          throw new APIError(
            "This is the only super admin and cannot be deleted. Promote someone else first.",
            400
          );
        }
      },
    ],
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
    },
    {
      name: "role",
      type: "select",
      required: true,
      defaultValue: "worker",
      access: {
        create: canSetRole,
        update: canSetRole,
      },
      admin: {
        description:
          "Super admins can set any role. Admins can only create and manage Workers.",
      },
      options: [
        { label: "Super Admin — full control, manages user accounts", value: "superadmin" },
        { label: "Admin — all content and pricing, reads enquiries", value: "admin" },
        { label: "Worker — content editing only", value: "worker" },
      ],
    },
    {
      name: "jobTitle",
      type: "text",
      admin: {
        description: "Shown if this person appears on the public team section.",
      },
    },
  ],
};
