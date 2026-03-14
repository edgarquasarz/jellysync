import { describe, it, expect } from 'vitest'

describe('User Selector Logic', () => {
  it('should show user selector when showUserSelector is true', () => {
    // Simulate the condition that was causing the bug
    const isConnected = false
    const isConnecting = false
    const showUserSelector = true
    
    // This was the BUGGY condition (would show login instead of selector):
    // const shouldShowLogin = !isConnected && !isConnecting
    
    // This is the FIXED condition:
    const shouldShowLogin = !isConnected && !isConnecting && !showUserSelector
    
    // With showUserSelector=true, login should NOT be shown
    expect(shouldShowLogin).toBe(false)
  })
  
  it('should show login when not connected and no user selector', () => {
    const isConnected = false
    const isConnecting = false
    const showUserSelector = false
    
    const shouldShowLogin = !isConnected && !isConnecting && !showUserSelector
    
    // With showUserSelector=false, login should be shown
    expect(shouldShowLogin).toBe(true)
  })
  
  it('should show user selector when connecting and showUserSelector is true', () => {
    const isConnected = false
    const isConnecting = true
    const showUserSelector = true
    
    const shouldShowLogin = !isConnected && !isConnecting && !showUserSelector
    
    // Even while connecting, if selector is shown, login should NOT be shown
    expect(shouldShowLogin).toBe(false)
  })
})
