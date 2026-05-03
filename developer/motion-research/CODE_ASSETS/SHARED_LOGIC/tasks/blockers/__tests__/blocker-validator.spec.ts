import { TaskBlockerSpec, validateBlockers } from '../blocker-validator'

/**
 * Test cases to verify the blocker validation.
 */
describe('Blocker validity tests', () => {
  describe('verify reference scope', () => {
    it('valid blocker references in scope', () => {
      const tasks: TaskBlockerSpec[] = [
        {
          id: 'A',
        },
        {
          id: 'B',
          blockingTaskIds: ['A'],
        },
        {
          id: 'C',
          blockingTaskIds: ['B'],
        },
      ]

      const result = validateBlockers(tasks)

      expect(result.valid).toBe(true)
    })

    it('invalid blocker reference to task D out of scope', () => {
      const tasks: TaskBlockerSpec[] = [
        {
          id: 'A',
        },
        {
          id: 'B',
          blockingTaskIds: ['A'],
        },
        {
          id: 'C',
          blockingTaskIds: ['D'],
        },
      ]

      const result = validateBlockers(tasks)

      expect(result.valid).toBe(false)
    })

    it('invalid blocker reference to task D out of scope (legacy ID)', () => {
      const tasks: TaskBlockerSpec[] = [
        {
          id: 'A',
        },
        {
          id: 'B',
          blockingTaskIds: ['A'],
        },
        {
          id: 'C',
          blockedByTaskId: 'D',
        },
      ]

      const result = validateBlockers(tasks)

      expect(result.valid).toBe(false)
    })
  })

  describe('verify cycle detection', () => {
    it('valid and has no cycles present', () => {
      const tasks: TaskBlockerSpec[] = [
        {
          id: 'A',
        },
        {
          id: 'B',
          blockingTaskIds: ['A'],
        },
        {
          id: 'C',
          blockingTaskIds: ['A'],
        },
        {
          id: 'D',
          blockingTaskIds: ['B', 'C'],
        },
      ]

      const result = validateBlockers(tasks)

      expect(result.valid).toBe(true)
    })

    it('invalid due to cycles present', () => {
      const tasks: TaskBlockerSpec[] = [
        {
          id: 'A',
        },
        {
          id: 'B',
          blockingTaskIds: ['A'],
        },
        {
          id: 'C',
          blockingTaskIds: ['A', 'D'], // 👈 C references D
        },
        {
          id: 'D',
          blockingTaskIds: ['B', 'C'], // 👈 D references C
        },
      ]

      const result = validateBlockers(tasks)

      expect(result.valid).toBe(false)
    })

    it('invalid due to cycles present (legacy)', () => {
      const tasks: TaskBlockerSpec[] = [
        {
          id: 'A',
        },
        {
          id: 'B',
          blockingTaskIds: ['A'],
        },
        {
          id: 'C',
          blockedByTaskId: 'D', // 👈 C references D
        },
        {
          id: 'D',
          blockedByTaskId: 'C', // 👈 D references C
        },
      ]

      const result = validateBlockers(tasks)

      expect(result.valid).toBe(false)
    })
  })

  describe('verify order check', () => {
    it('valid blocker reference order', () => {
      const tasks: TaskBlockerSpec[] = [
        {
          id: 'A',
        },
        {
          id: 'B',
          blockingTaskIds: ['A'],
        },
        {
          id: 'C',
          blockingTaskIds: ['B'],
        },
        {
          id: 'D',
          blockingTaskIds: ['A', 'C'],
        },
      ]

      const result = validateBlockers(tasks)

      expect(result.valid).toBe(true)
    })

    it('invalid blocker reference order', () => {
      const tasks: TaskBlockerSpec[] = [
        {
          id: 'A',
        },
        {
          id: 'B',
          blockingTaskIds: ['C'], // 👈 C comes after
        },
        {
          id: 'C',
        },
      ]

      const result = validateBlockers(tasks)

      expect(result.valid).toBe(false)
    })

    it('invalid blocker reference order (legacy)', () => {
      const tasks: TaskBlockerSpec[] = [
        {
          id: 'A',
        },
        {
          id: 'B',
          blockedByTaskId: 'C', // 👈 C comes after
        },
        {
          id: 'C',
        },
      ]

      const result = validateBlockers(tasks)

      expect(result.valid).toBe(false)
    })
  })
})
