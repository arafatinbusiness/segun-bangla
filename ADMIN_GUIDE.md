# Admin Dashboard Guide - সেগুন বাংলা

## Overview

The admin dashboard provides a complete suite of tools for managing your news portal. Access it at `/admin` once you're authenticated.

## Dashboard Pages

### 1. Overview (`/admin`)
The main dashboard displays key statistics:
- **Total Articles**: Complete count of all published articles
- **Total Categories**: Number of active content categories
- **Total Views**: Aggregate view count across all articles
- **Average Views**: Mean views per article

Also shows a table of the 5 most recent articles with quick-edit links.

### 2. Articles Management (`/admin/articles`)

#### List View
- View all articles in a comprehensive table format
- See titles, categories, view counts, and publication dates
- Quick actions for each article:
  - **View**: Opens the published article in a new tab
  - **Edit**: Modify article content and metadata
  - **Delete**: Remove article (with confirmation)

#### Create New Article (`/admin/articles/new`)
Complete form to create articles with fields:
- **Title** (required): Article headline
- **Slug** (required): URL-friendly identifier (e.g., `breaking-news-today`)
- **Excerpt**: Short summary for previews
- **Content** (required): Full article body
- **Image URL**: Featured image link
- **Category**: Assign to one of 30+ categories
- **Flags**:
  - Mark as Lead: Highlights on homepage hero section
  - Mark as Special: Featured article treatment

#### Edit Article (`/admin/articles/[id]`)
Same form as creation, pre-populated with existing data. All fields are editable.

### 3. Categories Management (`/admin/categories`)

#### Features
- View all 30+ categories in a grid layout
- Each category card shows:
  - Category name
  - URL slug
  - Description (if available)
- Quick actions:
  - **Edit**: Modify category details
  - **Delete**: Remove category

#### Create/Edit Categories
Form includes:
- **Name**: Category title (Bengali)
- **Slug**: URL identifier
- **Description**: Optional explanation of the category

### 4. Analytics (`/admin/analytics`)

#### Metrics Displayed
- **Total Views**: Sum of all article views
- **Average Views**: Mean views per article
- **Maximum Views**: Highest viewed article count
- **Total Articles**: Number of published pieces

#### Top 10 Articles Table
Shows the most viewed articles with:
- Ranking (#1-10)
- Article title
- View count
- Percentage of total views (with visual bar)
- Publication date

Helps identify content performance and trending topics.

### 5. Users (`/admin/users`)
Currently under development. Will support:
- User account management
- Role-based access control (admin, editor, contributor)
- User activity logs

### 6. Settings (`/admin/settings`)
System configuration interface for:
- Site information (name, URL, description)
- Email configuration
- API settings (coming soon)

## Database Integration

The admin dashboard connects to Firebase Firestore with these collections:

### Articles Collection
```
/articles/{docId}
├── title: string
├── slug: string
├── content: string (markdown)
├── excerpt: string
├── imageUrl: string
├── categoryId: string
├── isLead: boolean
├── isSpecial: boolean
├── viewCount: number
└── publishedAt: timestamp
```

### Categories Collection
```
/categories/{id}
├── name: string
├── slug: string
├── description: string (optional)
└── subcategories: subcollection
```

## Workflow Examples

### Publishing a News Story

1. Navigate to **Articles** → **Create New**
2. Fill in the headline, slug, and excerpt
3. Write the full content in the content field
4. Add a featured image URL
5. Select the appropriate category
6. Check "Mark as Lead" if it's breaking news
7. Click "Save Article"
8. The article appears on the homepage immediately

### Managing Content Categories

1. Go to **Categories** to see all sections
2. Click **Edit** to rename or update descriptions
3. Use the slug field for consistency in URL structures
4. Subdirectories automatically nest under main categories

### Analyzing Article Performance

1. Visit **Analytics** to see statistics
2. Review the **Top 10 Articles** table
3. Identify trending topics and reader preferences
4. Use insights to plan future content

## Best Practices

### Content Guidelines
- **Slugs**: Use lowercase, hyphens instead of spaces (e.g., `breaking-news`, not `Breaking News`)
- **Titles**: Keep under 80 characters for optimal display on mobile
- **Excerpts**: 120-150 characters for preview cards
- **Images**: Use links to high-quality images (ideally 1200x630px)
- **Content**: Support markdown formatting with clear paragraph breaks

### Category Organization
- Keep category count under 30 for optimal UX
- Group related topics under appropriate parents
- Maintain consistent naming conventions (singular or plural)

### Lead Articles
- Mark 1-3 articles as "Lead" for featured placement
- Update regularly (daily/weekly) to keep homepage fresh
- Combine with high-quality featured images

## Technical Notes

### SEO Integration
Each article page automatically generates:
- Dynamic meta tags (title, description)
- Open Graph tags for social sharing
- JSON-LD structured data
- Canonical URLs

### Performance
- Articles use Next.js ISR (Incremental Static Regeneration)
- Homepage rebuilds every 3600 seconds
- Images lazy-load for faster page loads
- View counts update in real-time

### Authentication
Admin panel access requires Firebase Authentication setup. Contact your developer to configure authentication roles.

## Troubleshooting

### Articles Not Appearing
- Verify the article's publication date is not in the future
- Ensure category ID exists in the categories collection
- Check that required fields (title, slug, content) are filled

### Images Not Loading
- Verify the image URL is publicly accessible
- Use HTTPS URLs for better performance
- Test the URL directly in a browser

### Performance Issues
- Limit categories to reduce navigation complexity
- Archive old articles to keep collection size manageable
- Use the Analytics page to monitor query performance

## Future Enhancements

Coming soon:
- Scheduled publishing (publish at specific time/date)
- Article versioning and drafts
- Multi-language support
- Social media integration
- Email newsletter system
- Advanced permission controls
- Content moderation queue

---

For technical support or feature requests, contact the development team.
