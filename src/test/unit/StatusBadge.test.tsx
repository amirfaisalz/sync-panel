import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatusBadge } from '@/components/integrations/StatusBadge'

describe('StatusBadge', () => {
  it('should render synced status', () => {
    render(<StatusBadge status="synced" />)
    expect(screen.getByText('Synced')).toBeInTheDocument()
  })

  it('should render syncing status', () => {
    render(<StatusBadge status="syncing" />)
    expect(screen.getByText('Syncing')).toBeInTheDocument()
  })

  it('should render conflict status', () => {
    render(<StatusBadge status="conflict" />)
    expect(screen.getByText('Conflict')).toBeInTheDocument()
  })

  it('should render error status', () => {
    render(<StatusBadge status="error" />)
    expect(screen.getByText('Error')).toBeInTheDocument()
  })

  it('should apply custom className', () => {
    render(<StatusBadge status="synced" className="custom-class" />)
    const badge = screen.getByText('Synced')
    expect(badge).toHaveClass('custom-class')
  })
})