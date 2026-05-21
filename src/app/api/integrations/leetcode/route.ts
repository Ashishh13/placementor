import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const username = req.nextUrl.searchParams.get('username')
  if (!username) return NextResponse.json({ error: 'Username required' }, { status: 400 })

  try {
    const query = `
      query getUserProfile($username: String!) {
        matchedUser(username: $username) {
          username
          profile {
            realName
            ranking
            reputation
            starRating
          }
          submitStats: submitStatsGlobal {
            acSubmissionNum {
              difficulty
              count
              submissions
            }
          }
          badges { name icon }
          tagProblemCounts {
            advanced { tagName problemsSolved }
            intermediate { tagName problemsSolved }
            fundamental { tagName problemsSolved }
          }
        }
        userContestRanking(username: $username) {
          attendedContestsCount
          rating
          globalRanking
          topPercentage
        }
      }
    `

    const res = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Referer': 'https://leetcode.com' },
      body: JSON.stringify({ query, variables: { username } }),
    })

    const data = await res.json()
    const user = data?.data?.matchedUser
    if (!user) return NextResponse.json({ error: 'LeetCode user not found' }, { status: 404 })

    const stats = user.submitStats?.acSubmissionNum ?? []
    const easy = stats.find((s: { difficulty: string }) => s.difficulty === 'Easy')?.count ?? 0
    const medium = stats.find((s: { difficulty: string }) => s.difficulty === 'Medium')?.count ?? 0
    const hard = stats.find((s: { difficulty: string }) => s.difficulty === 'Hard')?.count ?? 0
    const total = easy + medium + hard

    const contestRanking = data?.data?.userContestRanking

    const topTags = [
      ...(user.tagProblemCounts?.fundamental ?? []),
      ...(user.tagProblemCounts?.intermediate ?? []),
      ...(user.tagProblemCounts?.advanced ?? []),
    ]
      .sort((a: { problemsSolved: number }, b: { problemsSolved: number }) => b.problemsSolved - a.problemsSolved)
      .slice(0, 6)

    return NextResponse.json({
      username: user.username,
      name: user.profile?.realName,
      ranking: user.profile?.ranking,
      totalSolved: total,
      easy, medium, hard,
      badges: user.badges?.slice(0, 4) ?? [],
      contestRating: Math.round(contestRanking?.rating ?? 0),
      contestsAttended: contestRanking?.attendedContestsCount ?? 0,
      topPercentage: contestRanking?.topPercentage ?? null,
      topTags,
    })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch LeetCode data' }, { status: 500 })
  }
}