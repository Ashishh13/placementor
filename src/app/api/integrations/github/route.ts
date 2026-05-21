import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const username = req.nextUrl.searchParams.get('username')
  if (!username) return NextResponse.json({ error: 'Username required' }, { status: 400 })

  try {
    const headers: HeadersInit = { 'Accept': 'application/vnd.github.v3+json' }

    const [userRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${username}`, { headers }),
      fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`, { headers }),
    ])

    if (!userRes.ok) return NextResponse.json({ error: 'GitHub user not found' }, { status: 404 })

    const user = await userRes.json()
    const repos = await reposRes.json()

    const languages: Record<string, number> = {}
    let totalStars = 0
    let totalForks = 0

    for (const repo of repos) {
      if (!repo.fork) {
        totalStars += repo.stargazers_count
        totalForks += repo.forks_count
        if (repo.language) {
          languages[repo.language] = (languages[repo.language] ?? 0) + 1
        }
      }
    }

    const topLanguages = Object.entries(languages)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([lang, count]) => ({ lang, count }))

    const recentRepos = repos
      .filter((r: { fork: boolean }) => !r.fork)
      .slice(0, 5)
      .map((r: {
        name: string; description: string; html_url: string;
        language: string; stargazers_count: number; updated_at: string
      }) => ({
        name: r.name,
        description: r.description,
        url: r.html_url,
        language: r.language,
        stars: r.stargazers_count,
        updated: r.updated_at,
      }))

    return NextResponse.json({
      username: user.login,
      name: user.name,
      avatar: user.avatar_url,
      bio: user.bio,
      followers: user.followers,
      following: user.following,
      publicRepos: user.public_repos,
      totalStars,
      totalForks,
      topLanguages,
      recentRepos,
      profileUrl: user.html_url,
    })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch GitHub data' }, { status: 500 })
  }
}