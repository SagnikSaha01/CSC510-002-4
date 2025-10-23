"use client"

interface MoodInputProps {
  mood: string
  setMood: (mood: string) => void
}

export default function MoodInput({ mood, setMood }: MoodInputProps) {
  return (
    <input
      type="text"
      value={mood}
      onChange={(e) => setMood(e.target.value)}
      placeholder="Describe how you're feeling..."
      className="flex-1 px-6 py-3 bg-card text-foreground border-2 border-border rounded-lg focus:outline-none focus:border-primary transition-colors placeholder:text-muted-foreground text-lg"
    />
  )
}
