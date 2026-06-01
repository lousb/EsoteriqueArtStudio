import { defineField, defineType } from "sanity";

export const blogColumnBlock = defineType({
  name: "blogColumnBlock",
  title: "Column Block",
  type: "object",
  fields: [
    defineField({
      name: "columnCount",
      title: "Number of Columns",
      type: "number",
      initialValue: 2,
      options: {
        list: [
          { title: "2 columns", value: 2 },
          { title: "3 columns", value: 3 },
          { title: "4 columns", value: 4 },
        ],
        layout: "radio",
      },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "columns",
      title: "Columns",
      type: "array",
      description: "Add content for each column. Leave a column out to keep it empty.",
      of: [
        {
          type: "object",
          name: "blogColumn",
          title: "Column",
          fields: [
            defineField({
              name: "columnType",
              title: "Column Type",
              type: "string",
              options: {
                list: [
                  { title: "Empty", value: "empty" },
                  { title: "Media", value: "media" },
                  { title: "Text", value: "text" },
                ],
                layout: "radio",
              },
              initialValue: "empty",
            }),
            defineField({
              name: "media",
              title: "Media",
              type: "media",
              hidden: ({ parent }) => parent?.columnType !== "media",
            }),
            defineField({
              name: "text",
              title: "Text",
              type: "blockContent",
              hidden: ({ parent }) => parent?.columnType !== "text",
            }),
          ],
          preview: {
            select: {
              columnType: "columnType",
              image: "media.image",
            },
            prepare({ columnType, image }) {
              return {
                title:
                  columnType === "text"
                    ? "Text Column"
                    : columnType === "empty"
                    ? "Empty Column"
                    : "Media Column",
                media: columnType === "media" ? image : undefined,
              };
            },
          },
        },
      ],
      validation: (Rule) =>
        Rule.custom((columns: any[] | undefined, context) => {
          const parent = context.parent as any;
          const requiredCount = parent?.columnCount ?? 2;

          if (!columns || columns.length === 0) {
            return `You need ${requiredCount} column(s).`;
          }
          if (columns.length < requiredCount) {
            return `This is a ${requiredCount}-column block — add ${requiredCount - columns.length} more column(s).`;
          }
          if (columns.length > requiredCount) {
            return `This is a ${requiredCount}-column block — remove ${columns.length - requiredCount} column(s).`;
          }

          return true;
        }),
    }),
  ],
  preview: {
    select: { columnCount: "columnCount", columns: "columns" },
    prepare({ columnCount, columns }) {
      const count = columns?.length || 0;
      return {
        title: `${columnCount ?? 2}-Column Block`,
        subtitle: count
          ? columns.map((c: any) =>
              c.columnType === "text" ? "Text" : c.columnType === "empty" ? "—" : "Media"
            ).join(" · ")
          : "Empty",
      };
    },
  },
});