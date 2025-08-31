// Sanity Schema Definitions
// These schemas define the structure of documents in Sanity CMS

// Prestasi (Achievement) Schema
export const prestasiSchema = {
  name: 'prestasi',
  title: 'Prestasi',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text'
    },
    {
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {
        hotspot: true
      }
    }
  ],
  preview: {
    select: {
      title: 'title',
      media: 'image'
    }
  }
};

// Blog Post Schema (replacing poststunda)
export const blogPostSchema = {
  name: 'blogPost',
  title: 'Blog Post',
  type: 'document',
  fields: [
    {
      name: 'judul',
      title: 'Judul (Title)',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'judul',
        maxLength: 96
      },
      validation: Rule => Rule.required()
    },
    {
      name: 'description',
      title: 'Description/Excerpt',
      type: 'text',
      description: 'A brief description or excerpt of the post for previews',
      validation: Rule => Rule.max(300)
    },
    {
      name: 'author',
      title: 'Author',
      type: 'string',
      description: 'Name of the post author'
    },
    {
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          {title: 'News', value: 'news'},
          {title: 'Announcement', value: 'announcement'},
          {title: 'Event', value: 'event'},
          {title: 'Achievement', value: 'achievement'},
          {title: 'General', value: 'general'}
        ]
      }
    },
    {
      name: 'isi',
      title: 'Isi (Content)',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [
            {title: 'Normal', value: 'normal'},
            {title: 'H1', value: 'h1'},
            {title: 'H2', value: 'h2'},
            {title: 'H3', value: 'h3'},
            {title: 'Quote', value: 'blockquote'}
          ],
          lists: [
            {title: 'Bullet', value: 'bullet'},
            {title: 'Numbered', value: 'number'}
          ],
          marks: {
            decorators: [
              {title: 'Strong', value: 'strong'},
              {title: 'Emphasis', value: 'em'},
              {title: 'Code', value: 'code'}
            ],
            annotations: [
              {
                title: 'URL',
                name: 'link',
                type: 'object',
                fields: [
                  {
                    title: 'URL',
                    name: 'href',
                    type: 'url'
                  }
                ]
              }
            ]
          }
        },
        {
          type: 'image',
          options: {
            hotspot: true
          },
          fields: [
            {
              name: 'alt',
              title: 'Alternative Text',
              type: 'string',
              description: 'Important for SEO and accessibility.'
            },
            {
              name: 'caption',
              title: 'Caption',
              type: 'string'
            }
          ]
        }
      ]
    },
    {
      name: 'gambarThumbnail',
      title: 'Thumbnail Image',
      type: 'image',
      options: {
        hotspot: true
      }
    },
    {
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          {title: 'Draft', value: 'draft'},
          {title: 'Pending Review', value: 'pending'},
          {title: 'Published', value: 'published'}
        ],
        layout: 'radio'
      },
      initialValue: 'draft',
      validation: Rule => Rule.required()
    },
    {
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime',
      initialValue: () => new Date().toISOString()
    },
    {
      name: 'updatedAt',
      title: 'Last Updated',
      type: 'datetime',
      description: 'Automatically updated when the post is modified'
    },
    {
      name: 'lastModified',
      title: 'Last Modified By',
      type: 'string',
      description: 'User who last modified this post'
    }
  ],
  preview: {
    select: {
      title: 'judul',
      media: 'gambarThumbnail'
    }
  }
};

// Carousel Image Schema
export const carouselImageSchema = {
  name: 'carouselImage',
  title: 'Carousel Image',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string'
    },
    {
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {
        hotspot: true
      },
      validation: Rule => Rule.required()
    },
    {
      name: 'alt',
      title: 'Alt Text',
      type: 'string'
    },
    {
      name: 'order',
      title: 'Display Order',
      type: 'number',
      initialValue: 0
    }
  ],
  preview: {
    select: {
      title: 'title',
      media: 'image',
      order: 'order'
    },
    prepare(selection) {
      const { title, media, order } = selection;
      return {
        title: title || 'Carousel Image',
        subtitle: `Order: ${order}`,
        media
      };
    }
  }
};

// Album Schema (replacing album_foto)
export const albumSchema = {
  name: 'album',
  title: 'Photo Album',
  type: 'document',
  fields: [
    {
      name: 'albumName',
      title: 'Album Name',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text'
    },
    {
      name: 'images',
      title: 'Images',
      type: 'array',
      of: [
        {
          type: 'image',
          options: {
            hotspot: true
          },
          fields: [
            {
              name: 'caption',
              title: 'Caption',
              type: 'string'
            }
          ]
        }
      ]
    },
    {
      name: 'coverImage',
      title: 'Cover Image',
      type: 'image',
      options: {
        hotspot: true
      }
    },
    {
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime',
      initialValue: () => new Date().toISOString()
    }
  ],
  preview: {
    select: {
      title: 'albumName',
      media: 'coverImage'
    }
  }
};

// Agenda Schema
export const agendaSchema = {
  name: 'agenda',
  title: 'Agenda',
  type: 'document',
  fields: [
    {
      name: 'judul',
      title: 'Judul (Title)',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'isi',
      title: 'Isi (Content)',
      type: 'text'
    },
    {
      name: 'tanggal',
      title: 'Tanggal (Date)',
      type: 'datetime'
    },
    {
      name: 'lokasi',
      title: 'Lokasi (Location)',
      type: 'string'
    },
    {
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime',
      initialValue: () => new Date().toISOString()
    }
  ],
  preview: {
    select: {
      title: 'judul',
      subtitle: 'tanggal'
    }
  }
};

// User schema for authentication
export const userSchema = {
  name: 'user',
  title: 'Admin Users',
  type: 'document',
  fields: [
    {
      name: 'email',
      title: 'Email',
      type: 'string',
      validation: Rule => Rule.required().email()
    },
    {
      name: 'password',
      title: 'Password Hash',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'displayName',
      title: 'Display Name',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'role',
      title: 'Role',
      type: 'string',
      options: {
        list: [
          { title: 'Super Admin', value: 'superadmin' },
          { title: 'Admin', value: 'admin' },
          { title: 'Editor', value: 'editor' }
        ]
      },
      initialValue: 'admin'
    },
    {
      name: 'isActive',
      title: 'Is Active',
      type: 'boolean',
      initialValue: true
    },
    {
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime',
      initialValue: () => new Date().toISOString()
    }
  ],
  preview: {
    select: {
      title: 'displayName',
      subtitle: 'email',
      role: 'role'
    },
    prepare(selection) {
      const { title, subtitle, role } = selection;
      return {
        title: title,
        subtitle: `${subtitle} (${role})`
      };
    }
  }
};

// Document Schema (for general documents)
export const documentSchema = {
  name: 'generalDocument',
  title: 'General Document',
  type: 'document',
  fields: [
    {
      name: 'judul',
      title: 'Judul (Title)',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'isi',
      title: 'Isi (Content)',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [
            {title: 'Normal', value: 'normal'},
            {title: 'H1', value: 'h1'},
            {title: 'H2', value: 'h2'},
            {title: 'H3', value: 'h3'},
            {title: 'Quote', value: 'blockquote'}
          ],
          lists: [
            {title: 'Bullet', value: 'bullet'},
            {title: 'Numbered', value: 'number'}
          ],
          marks: {
            decorators: [
              {title: 'Strong', value: 'strong'},
              {title: 'Emphasis', value: 'em'},
              {title: 'Code', value: 'code'}
            ],
            annotations: [
              {
                title: 'URL',
                name: 'link',
                type: 'object',
                fields: [
                  {
                    title: 'URL',
                    name: 'href',
                    type: 'url'
                  }
                ]
              }
            ]
          }
        },
        {
          type: 'image',
          options: {
            hotspot: true
          },
          fields: [
            {
              name: 'alt',
              title: 'Alternative Text',
              type: 'string',
              description: 'Important for SEO and accessibility.'
            },
            {
              name: 'caption',
              title: 'Caption',
              type: 'string'
            }
          ]
        }
      ]
    },
    {
      name: 'gambarThumbnail',
      title: 'Thumbnail Image',
      type: 'image',
      options: {
        hotspot: true
      }
    },
    {
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime',
      initialValue: () => new Date().toISOString()
    }
  ],
  preview: {
    select: {
      title: 'judul',
      media: 'gambarThumbnail'
    }
  }
};

// Waiting To Review schema for managing pending posts
const waitingToReviewSchema = {
  name: 'waitingToReview',
  title: 'Waiting To Review',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'This is a virtual collection for pending blog posts'
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
      initialValue: 'This section shows all blog posts that are waiting for superadmin review and approval.'
    }
  ],
  preview: {
    select: {
      title: 'title'
    }
  }
};

// Export all schemas as an array for easy import
export const schemas = [
  prestasiSchema,
  blogPostSchema,
  carouselImageSchema,
  albumSchema,
  agendaSchema,
  userSchema,
  documentSchema,
  waitingToReviewSchema
];

export default schemas;