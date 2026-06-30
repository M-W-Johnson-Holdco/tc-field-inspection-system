export function fieldGroupClass(field, extra = '') {
  const layout = ['multiRadio', 'multi', 'toggleMulti', 'textarea'].includes(field.t)
    ? 'field-group--full'
    : 'field-group--compact'
  return extra ? `field-group ${layout} ${extra}` : `field-group ${layout}`
}
