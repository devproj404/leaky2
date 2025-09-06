/**
 * Utility functions for handling scheduled content
 */

/**
 * Check if a content item is published
 * @param content The content item to check
 * @returns boolean indicating if the content is published
 */
export function isPublished(content: any): boolean {
  // Content is published if is_published is true and it's not scheduled
  return content.is_published === true && content.is_scheduled !== true
}

/**
 * Check if a scheduled content item should be published
 * @param content The content item to check
 * @returns boolean indicating if the content should be published
 */
export function shouldPublish(content: any): boolean {
  if (!content.is_scheduled || !content.publish_at) {
    return false
  }
  
  const publishDate = new Date(content.publish_at)
  const currentDate = new Date()
  
  return publishDate <= currentDate
}
