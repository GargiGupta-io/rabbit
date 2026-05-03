import { BlockerGraph } from '../blocker-graph'

describe('Blocker graph tests', () => {
  describe('hasCycle returns false', () => {
    it('simple no cycle', () => {
      const graph = new BlockerGraph()
      graph.addEdge('A', 'B')
      graph.addEdge('B', 'C')
      graph.addEdge('C', 'D')

      expect(graph.hasCycle()).toBe(false)
    })
  })

  describe('hasCycle returns true', () => {
    it('simple cycle', () => {
      const graph = new BlockerGraph()
      graph.addEdge('A', 'B')
      graph.addEdge('B', 'C')
      graph.addEdge('C', 'A')

      expect(graph.hasCycle()).toBe(true)
    })

    it('cycle with multiple edges', () => {
      const graph = new BlockerGraph()
      graph.addEdge('A', 'B')
      graph.addEdge('B', 'C')
      graph.addEdge('C', 'D')

      expect(graph.hasCycle()).toBe(false)

      graph.addEdge('D', 'B')

      expect(graph.hasCycle()).toBe(true)
    })

    it('cycle that is created between two different sub graphs', () => {
      const graph = new BlockerGraph()
      graph.addEdge('A', 'B')
      graph.addEdge('B', 'C')
      graph.addEdge('C', 'D')

      graph.addEdge('E', 'F')
      graph.addEdge('F', 'G')
      graph.addEdge('G', 'H')
      graph.addEdge('H', 'A')

      expect(graph.hasCycle()).toBe(false)

      graph.addEdge('D', 'E')

      expect(graph.hasCycle()).toBe(true)
    })
  })
})
