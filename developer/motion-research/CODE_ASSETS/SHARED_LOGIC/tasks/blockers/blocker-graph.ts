type NodeId = string

export class BlockerGraph {
  private adjacencyList: Map<NodeId, Set<NodeId>>

  constructor() {
    this.adjacencyList = new Map()
  }

  private addNode(id: NodeId): void {
    if (!this.adjacencyList.has(id)) {
      this.adjacencyList.set(id, new Set())
    }
  }

  addEdge(from: NodeId, to: NodeId): void {
    this.addNode(from)
    this.addNode(to)
    this.adjacencyList.get(from)!.add(to)
  }

  hasCycle(): boolean {
    // Set to keep track of all visited nodes throughout the entire search
    const visited = new Set<NodeId>()

    // Set to keep track of nodes in the current DFS path
    // This helps detect cycles within the current exploration path
    const recursionStack = new Set<NodeId>()

    // Depth-First Search (DFS) function
    const dfs = (node: NodeId): boolean => {
      // If the node is already in the recursion stack, we've found a cycle
      if (recursionStack.has(node)) {
        return true
      }

      // If we've already visited this node in a previous DFS call and didn't find a cycle, skip it
      if (visited.has(node)) {
        return false
      }

      // Mark the current node as visited and add it to the recursion stack
      visited.add(node)
      recursionStack.add(node)

      // Explore all neighbors of the current node
      for (const neighbor of this.adjacencyList.get(node)!) {
        if (dfs(neighbor)) {
          return true
        }
      }

      // Remove the current node from the recursion stack as we're done exploring it
      recursionStack.delete(node)
      return false // No cycle found in this path
    }

    // Perform DFS from each node to ensure we explore all connected components
    for (const node of this.adjacencyList.keys()) {
      if (dfs(node)) {
        return true // Cycle found in one of the DFS explorations
      }
    }

    return false // No cycle found in the entire graph
  }
}
