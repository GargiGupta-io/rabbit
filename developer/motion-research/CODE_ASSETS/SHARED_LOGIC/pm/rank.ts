export const getNextRank = (position = 0) => {
  // Given the position of an item in a list, return the rank of that item
  return (1 + position * 8).toString(36).padStart(5, '0')
}
