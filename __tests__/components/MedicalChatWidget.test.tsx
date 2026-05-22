import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MedicalChatWidget from '@/components/MedicalChatWidget'

const mockFetch = jest.fn()
global.fetch = mockFetch

// Returns a mock Response whose body.getReader() yields the given text in one chunk
function makeStreamResponse(text: string): Response {
  const bytes = Buffer.from(text)
  let done = false
  return {
    ok: true,
    status: 200,
    headers: new Headers({ 'Content-Type': 'text/plain' }),
    body: {
      getReader() {
        return {
          async read() {
            if (!done) {
              done = true
              return { done: false, value: new Uint8Array(bytes) }
            }
            return { done: true, value: undefined }
          },
        }
      },
    },
  } as unknown as Response
}

const DEFAULT_PROPS = {
  patientName: 'Ram',
  conditions: ['Hypertension'],
  medications: ['Amlodipine 5mg'],
}

describe('MedicalChatWidget', () => {
  beforeEach(() => {
    mockFetch.mockReset()
  })

  it('renders the welcome message with the patient name', () => {
    render(<MedicalChatWidget {...DEFAULT_PROPS} />)
    expect(screen.getByText(/Namaste Ram/i)).toBeInTheDocument()
  })

  it('shows the patient context badge when conditions are provided', () => {
    render(<MedicalChatWidget {...DEFAULT_PROPS} />)
    expect(screen.getByText(/Hypertension/)).toBeInTheDocument()
  })

  it('does not show context badge when no conditions or medications', () => {
    render(<MedicalChatWidget patientName="Ram" conditions={[]} medications={[]} />)
    expect(screen.queryByText(/AI knows your context/)).not.toBeInTheDocument()
  })

  it('shows quick question buttons on initial render', () => {
    render(<MedicalChatWidget {...DEFAULT_PROPS} />)
    expect(screen.getByText(/dengue fever/i)).toBeInTheDocument()
  })

  it('populates input when a quick question is clicked', async () => {
    render(<MedicalChatWidget {...DEFAULT_PROPS} />)
    const btn = screen.getByText(/dengue fever/i)
    await userEvent.click(btn)
    const input = screen.getByPlaceholderText(/Ask a health question/i) as HTMLInputElement
    expect(input.value).toContain('dengue')
  })

  it('send button is disabled when input is empty', () => {
    render(<MedicalChatWidget {...DEFAULT_PROPS} />)
    const buttons = screen.getAllByRole('button')
    const sendButton = buttons[buttons.length - 1]
    expect(sendButton).toBeDisabled()
  })

  it('displays the assistant reply after sending a message', async () => {
    mockFetch.mockResolvedValueOnce(makeStreamResponse('Dengue is common in monsoon.'))

    render(<MedicalChatWidget {...DEFAULT_PROPS} />)
    const input = screen.getByPlaceholderText(/Ask a health question/i)

    await userEvent.type(input, 'Tell me about dengue')
    fireEvent.keyDown(input, { key: 'Enter' })

    await waitFor(() => {
      expect(screen.getByText('Tell me about dengue')).toBeInTheDocument()
    })

    await waitFor(() => {
      expect(screen.getByText(/Dengue is common in monsoon/i)).toBeInTheDocument()
    })
  })

  it('shows an error message when the API call fails', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    render(<MedicalChatWidget {...DEFAULT_PROPS} />)
    const input = screen.getByPlaceholderText(/Ask a health question/i)

    await userEvent.type(input, 'What is dengue?')
    fireEvent.keyDown(input, { key: 'Enter' })

    await waitFor(() => {
      expect(screen.getByText(/encountered an error/i)).toBeInTheDocument()
    })
  })

  it('clears chat when the clear button is clicked', async () => {
    mockFetch.mockResolvedValueOnce(makeStreamResponse('Dengue info.'))

    render(<MedicalChatWidget {...DEFAULT_PROPS} />)
    const input = screen.getByPlaceholderText(/Ask a health question/i)
    await userEvent.type(input, 'About dengue')
    fireEvent.keyDown(input, { key: 'Enter' })

    await waitFor(() => {
      expect(screen.getByText('About dengue')).toBeInTheDocument()
    })

    const clearBtn = screen.getByTitle('Clear chat')
    await userEvent.click(clearBtn)

    expect(screen.queryByText('About dengue')).not.toBeInTheDocument()
    expect(screen.getByText(/Namaste Ram/i)).toBeInTheDocument()
  })
})
