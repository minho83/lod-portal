/**
 * 텍스트 내 URL을 안전한 링크로 변환
 * XSS 방지를 위해 target="_blank" rel="noopener noreferrer" 사용
 */

const URL_REGEX = /(https?:\/\/[^\s]+)/g

export function linkify(text: string): React.ReactNode[] {
  const parts = text.split(URL_REGEX)

  return parts.map((part, index) => {
    if (part.match(URL_REGEX)) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline hover:text-primary/80 break-all"
        >
          {part}
        </a>
      )
    }
    return <span key={index}>{part}</span>
  })
}

/**
 * 텍스트 내 카카오톡 오픈채팅 URL만 링크로 변환 (화이트리스트 방식)
 */
const KAKAO_OPEN_CHAT_REGEX = /(https?:\/\/open\.kakao\.com\/[^\s]+)/g

export function linkifyKakao(text: string): React.ReactNode[] {
  const parts = text.split(KAKAO_OPEN_CHAT_REGEX)

  return parts.map((part, index) => {
    if (part.match(KAKAO_OPEN_CHAT_REGEX)) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline hover:text-primary/80 break-all inline-flex items-center gap-1"
        >
          💬 {part}
        </a>
      )
    }
    return <span key={index}>{part}</span>
  })
}

/**
 * 화이트리스트 기반 안전한 URL 링크 변환
 * 허용된 도메인: open.kakao.com, discord.gg, discord.com
 */
const SAFE_URL_REGEX = /(https?:\/\/(?:open\.kakao\.com|discord\.gg|discord\.com)\/[^\s]+)/g

export function linkifySafe(text: string): React.ReactNode[] {
  const parts = text.split(SAFE_URL_REGEX)

  return parts.map((part, index) => {
    if (part.match(SAFE_URL_REGEX)) {
      // 도메인별 아이콘
      let icon = "🔗"
      if (part.includes("kakao.com")) icon = "💬"
      if (part.includes("discord")) icon = "💬"

      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline hover:text-primary/80 break-all inline-flex items-center gap-1"
        >
          {icon} {part}
        </a>
      )
    }
    return <span key={index}>{part}</span>
  })
}
