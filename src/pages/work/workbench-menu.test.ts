import { describe, expect, it } from 'vitest'
import { getVisibleWorkbenchMenus } from './workbench-menu'

function keys(roles: string[] = [], permissions: string[] = []) {
  return getVisibleWorkbenchMenus({ roles, permissions }).map(item => item.key)
}

describe('workbench menu visibility', () => {
  it('shows common menus without role-specific access', () => {
    expect(keys()).toEqual(['requisition-apply', 'emergency-call', 'safety-learning'])
  })

  it('shows common menus for every configured system role', () => {
    for (const role of ['sysadmin', 'emergency', 'warehouse', 'leader', 'trainer', 'member']) {
      expect(keys([role])).toEqual(expect.arrayContaining(['requisition-apply', 'emergency-call', 'safety-learning']))
    }
  })

  it('requires both the configured role and permission', () => {
    expect(keys(['warehouse'])).not.toContain('stocktake')
    expect(keys(['warehouse'], ['material:stocktake:check'])).toContain('stocktake')
    expect(keys(['leader'], ['material:stocktake:check'])).not.toContain('requisition-approval')
    expect(keys(['leader'], ['material:requisition:audit'])).toContain('requisition-approval')
  })

  it('shows every configured menu to the super administrator', () => {
    expect(keys(['superadmin'])).toHaveLength(10)
    expect(keys([], ['*:*:*'])).toHaveLength(10)
  })
})
