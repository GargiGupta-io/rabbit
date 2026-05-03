export function getNameAndSecondNameInitial(inputName: string): string {
  const parts = inputName.split(' ')

  if (parts.length === 1) {
    return inputName
  }
  const firstName = parts[0]
  const lastName = parts[1]
  const lastNameInitial = lastName[0] + '.'

  return `${firstName} ${lastNameInitial}`.trim()
}
