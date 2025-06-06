/**
 * Generated by Kubb (https://kubb.dev/).
 * Do not edit manually.
 */

export type FileResponseDto = {
  /**
   * @description File ID
   * @type number
   */
  id: number
  /**
   * @description File name
   * @type string
   */
  filename: string
  /**
   * @description Original file name
   * @type string
   */
  originalname: string
  /**
   * @description File MIME type
   * @type string
   */
  mimetype: string
  /**
   * @description File size in bytes
   * @type number
   */
  size: number
  /**
   * @description File object name in storage
   * @type string
   */
  objectName: string
  /**
   * @description File prefix/folder in storage
   * @type string | undefined
   */
  prefix?: string | undefined
  /**
   * @description Storage bucket name
   * @type string
   */
  bucket: string
  /**
   * @description File category
   * @type string | undefined
   */
  category?: string | undefined
  /**
   * @description File description
   * @type string | undefined
   */
  description?: string | undefined
  /**
   * @description Whether the file is publicly accessible
   * @type boolean
   */
  isPublic: boolean
  /**
   * @description File creation date
   * @type string, date-time
   */
  createdAt: Date
  /**
   * @description File last update date
   * @type string, date-time
   */
  updatedAt: Date
  /**
   * @description Signed URL for accessing the file
   * @type string | undefined
   */
  url?: string | undefined
}