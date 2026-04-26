/**
 * @typedef {Object} AgentInput
 * @property {string} course_id
 * @property {string} channel_id
 * @property {'general'|'assignment'|'custom'} channel_type
 * @property {string} [assignment_id]
 * @property {'tutor'|'homework_helper'} mode
 * @property {Message[]} conversation_history
 * @property {string} user_message
 * @property {CourseContext} course_context
 */

/**
 * @typedef {Object} AgentResponse
 * @property {string} message
 * @property {Citation[]} citations
 * @property {string} [refusal_reason]
 */

/**
 * @typedef {Object} Message
 * @property {string} id
 * @property {'user'|'assistant'} role
 * @property {string} content
 * @property {Citation[]} [citations]
 * @property {string} created_at
 */

/**
 * @typedef {Object} Citation
 * @property {string} source
 * @property {string} snippet
 */

/**
 * @typedef {Object} CourseContext
 * @property {string} [syllabus]
 * @property {string[]} lectures
 * @property {string} [assignment_spec]
 * @property {string} [rubric]
 * @property {string} [professor_rules]
 */

export {};
