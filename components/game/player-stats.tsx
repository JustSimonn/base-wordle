interface PlayerStatsProps {
  username: string
  points: number
  streak: number
  balance: string
}

export function PlayerStats({ username, points, streak, balance }: PlayerStatsProps) {
  return (
    <div className="space-y-4">
      {/* Player Info Card */}
      <div className="bg-card border border-border rounded-lg p-6 space-y-4">
        <div>
          <p className="text-sm text-muted-foreground">Player</p>
          <p className="text-xl font-bold text-foreground">{username}</p>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Total Points</span>
            <span className="text-lg font-bold text-primary">{points}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Streak</span>
            <span className="text-lg font-bold text-accent">{streak}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Balance</span>
            <span className="text-lg font-bold text-foreground">{balance}</span>
          </div>
        </div>
      </div>

      {/* Placeholder for future integrations */}
      <div className="bg-card border border-dashed border-border rounded-lg p-6 text-center space-y-2">
        <p className="text-sm text-muted-foreground">Farcaster Frame</p>
        <p className="text-xs text-muted-foreground">Integration coming soon</p>
      </div>
    </div>
  )
}