/**
 * DisjointSet (Union-Find) Data Structure
 *
 * A highly efficient data structure for grouping elements and determining
 * if elements belong to the same group.
 *
 * This implementation uses:
 * - Path compression for find operations
 * - Union by rank for efficient merging
 *
 * Used for:
 * - Efficiently finding territory groups without multiple traversals
 * - Checking connectivity between territories in constant time
 * - Supporting the AdjacencyGraph for territory connectivity
 */
export class DisjointSet {
  /**
   * Create a new DisjointSet data structure
   */
  constructor() {
    // Maps element to its parent element
    this.parent = new Map();

    // Maps element to its rank (approximate tree height)
    this.rank = new Map();

    // Maps root element to the size of its group
    this.size = new Map();

    // Maps root element to all elements in its group (optional for fast group enumeration)
    this.groups = new Map();
  }

  /**
   * Add a new element to the disjoint set
   *
   * @param {*} element - Element to add
   * @returns {DisjointSet} this instance for chaining
   */
  makeSet(element) {
    if (!this.parent.has(element)) {
      this.parent.set(element, element); // Element is its own parent initially
      this.rank.set(element, 0); // Initial rank is 0
      this.size.set(element, 1); // Initial size is 1

      // Create a new group containing just this element
      const group = new Set([element]);
      this.groups.set(element, group);
    }
    return this;
  }

  /**
   * Find the root element (representative) of the set containing the given element
   * Uses path compression for efficiency
   *
   * @param {*} element - Element to find the representative for
   * @returns {*} Root element of the set
   */
  find(element) {
    if (!this.parent.has(element)) {
      this.makeSet(element);
      return element;
    }

    // Path compression: set each element's parent to the root
    if (this.parent.get(element) !== element) {
      this.parent.set(element, this.find(this.parent.get(element)));
    }

    return this.parent.get(element);
  }

  /**
   * Merge the sets containing the two elements
   * Uses union by rank for efficiency
   *
   * @param {*} element1 - First element
   * @param {*} element2 - Second element
   * @returns {DisjointSet} this instance for chaining
   */
  union(element1, element2) {
    // Ensure both elements are in the set
    if (!this.parent.has(element1)) this.makeSet(element1);
    if (!this.parent.has(element2)) this.makeSet(element2);

    const root1 = this.find(element1);
    const root2 = this.find(element2);

    // If already in the same set, nothing to do
    if (root1 === root2) return this;

    // Union by rank: attach the smaller rank tree under the root of the higher rank tree
    const rank1 = this.rank.get(root1);
    const rank2 = this.rank.get(root2);

    let newRoot;
    let mergedRoot;
    if (rank1 > rank2) {
      newRoot = root1;
      mergedRoot = root2;
    } else {
      newRoot = root2;
      mergedRoot = root1;

      // If ranks are the same, increment the rank of the new root
      if (rank1 === rank2) {
        this.rank.set(newRoot, rank2 + 1);
      }
    }

    // Update parent pointer
    this.parent.set(mergedRoot, newRoot);

    // Update size of the new root's group
    const newSize = this.size.get(newRoot) + this.size.get(mergedRoot);
    this.size.set(newRoot, newSize);

    // Merge the groups for fast enumeration
    const mergedGroup = this.groups.get(mergedRoot);
    const newGroup = this.groups.get(newRoot);

    for (const element of mergedGroup) {
      newGroup.add(element);
    }

    // Delete the merged group
    this.groups.delete(mergedRoot);

    return this;
  }

  /**
   * Check if two elements are in the same set
   *
   * @param {*} element1 - First element
   * @param {*} element2 - Second element
   * @returns {boolean} True if elements are in the same set
   */
  connected(element1, element2) {
    // If any element doesn't exist, they're not connected
    if (!this.parent.has(element1) || !this.parent.has(element2)) {
      return false;
    }

    return this.find(element1) === this.find(element2);
  }

  /**
   * Get the size of the set containing the element
   *
   * @param {*} element - Element to get the set size for
   * @returns {number} Size of the set containing the element
   */
  getSetSize(element) {
    if (!this.parent.has(element)) {
      return 0;
    }

    const root = this.find(element);
    return this.size.get(root);
  }

  /**
   * Get all elements in the same set as the given element
   *
   * @param {*} element - Element to get the set for
   * @returns {Set} Set of all elements in the same set
   */
  getGroup(element) {
    if (!this.parent.has(element)) {
      return new Set();
    }

    const root = this.find(element);
    return new Set(this.groups.get(root));
  }

  /**
   * Get all groups in the disjoint set
   *
   * @returns {Array<Set>} Array of sets, each representing a group
   */
  getAllGroups() {
    return [...this.groups.values()];
  }

  /**
   * Get the number of distinct groups
   *
   * @returns {number} Number of distinct groups
   */
  getGroupCount() {
    return this.groups.size;
  }

  /**
   * Reset the disjoint set to empty state
   *
   * @returns {DisjointSet} this instance for chaining
   */
  clear() {
    this.parent.clear();
    this.rank.clear();
    this.size.clear();
    this.groups.clear();
    return this;
  }

  /**
   * Create groups from an adjacency map
   * Elements that are adjacent will be merged into the same group
   *
   * @param {Map<*, Set<*>>} adjacencyMap - Map of element to set of adjacent elements
   * @returns {DisjointSet} this instance for chaining
   */
  static fromAdjacencyMap(adjacencyMap) {
    const disjointSet = new DisjointSet();

    // Add all elements as singleton sets
    for (const element of adjacencyMap.keys()) {
      disjointSet.makeSet(element);
    }

    // Union adjacent elements
    for (const [element, adjacentElements] of adjacencyMap.entries()) {
      for (const adjacent of adjacentElements) {
        disjointSet.union(element, adjacent);
      }
    }

    return disjointSet;
  }
}
