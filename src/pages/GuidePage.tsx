import { BookOpen, Bell, Users, ShoppingBag, Zap } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

export default function GuidePage() {
  return (
    <div className="container max-w-5xl py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <BookOpen className="w-8 h-8 text-primary" />
          <h1 className="text-2xl font-bold">사용 가이드</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          LOD 포털 사용법을 단계별로 안내합니다
        </p>
      </div>

      <Tabs defaultValue="intro" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="intro">
            <Zap className="w-4 h-4 mr-2" />
            시작하기
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="w-4 h-4 mr-2" />
            알림 설정
          </TabsTrigger>
          <TabsTrigger value="party">
            <Users className="w-4 h-4 mr-2" />
            파티 모집
          </TabsTrigger>
          <TabsTrigger value="market">
            <ShoppingBag className="w-4 h-4 mr-2" />
            거래소
          </TabsTrigger>
        </TabsList>

        {/* 시작하기 탭 */}
        <TabsContent value="intro">
          <IntroGuide />
        </TabsContent>

        {/* 알림 설정 탭 */}
        <TabsContent value="notifications">
          <NotificationGuide />
        </TabsContent>

        {/* 파티 모집 탭 */}
        <TabsContent value="party">
          <PartyGuide />
        </TabsContent>

        {/* 거래소 탭 */}
        <TabsContent value="market">
          <MarketGuide />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ============================================
// 시작하기 가이드
// ============================================

function IntroGuide() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>LOD 포털에 오신 것을 환영합니다!</CardTitle>
          <CardDescription>
            어둠의전설 게임 커뮤니티를 위한 통합 포털입니다
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Discord 회원가입 안내 */}
          <div>
            <h3 className="font-semibold text-lg mb-3">🎮 Discord 회원가입 (필수)</h3>
            <div className="space-y-4">
              <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">ℹ️</div>
                  <div className="text-sm">
                    <div className="font-semibold mb-1">Discord란?</div>
                    <div className="text-muted-foreground space-y-1">
                      <div>• 카카오톡과 비슷한 무료 메신저입니다</div>
                      <div>• 게임 유저들이 주로 사용하는 소통 프로그램입니다</div>
                      <div>• PC와 휴대폰 모두에서 사용할 수 있습니다</div>
                      <div>• LOD 포털은 Discord 계정으로 로그인합니다</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="font-medium text-sm">💻 PC에서 Discord 가입하기:</div>
                <div className="space-y-2 pl-4 border-l-2 border-primary/30">
                  <Step
                    number={1}
                    title="Discord 웹사이트 접속"
                    description="인터넷 주소창에 discord.com 입력 후 엔터"
                  />
                  <Step
                    number={2}
                    title="'Discord 열기' 클릭"
                    description="화면 중앙의 파란색 버튼 클릭"
                  />
                  <Step
                    number={3}
                    title="이메일로 가입"
                    description="이메일 주소, 사용자 이름(닉네임), 비밀번호 입력"
                  />
                  <Step
                    number={4}
                    title="생년월일 입력"
                    description="본인의 생년월일 입력 (만 13세 이상)"
                  />
                  <Step
                    number={5}
                    title="이메일 인증"
                    description="입력한 이메일로 온 인증 메일의 '이메일 인증' 버튼 클릭"
                  />
                  <Step
                    number={6}
                    title="가입 완료!"
                    description="Discord 회원가입이 완료되었습니다"
                  />
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <div className="text-sm space-y-2">
                  <div className="font-medium">📷 이미지 필요:</div>
                  <div className="text-muted-foreground">
                    • Discord 메인 페이지 스크린샷
                    <br />• 회원가입 화면 스크린샷
                    <br />• 이메일 인증 메일 스크린샷
                  </div>
                </div>
              </div>

              <div className="space-y-3 mt-4">
                <div className="font-medium text-sm">📱 스마트폰에서 Discord 가입하기:</div>
                <div className="space-y-2 pl-4 border-l-2 border-primary/30">
                  <Step
                    number={1}
                    title="앱 설치"
                    description="'Play 스토어' 또는 '앱스토어'에서 'Discord' 검색 후 설치"
                  />
                  <Step
                    number={2}
                    title="앱 실행"
                    description="설치한 Discord 앱 실행"
                  />
                  <Step
                    number={3}
                    title="회원가입 시작"
                    description="'계정 등록' 버튼 클릭"
                  />
                  <Step
                    number={4}
                    title="정보 입력"
                    description="이메일, 사용자 이름, 비밀번호, 생년월일 입력"
                  />
                  <Step
                    number={5}
                    title="이메일 인증"
                    description="이메일로 온 인증 메일 확인 후 인증"
                  />
                  <Step
                    number={6}
                    title="가입 완료!"
                    description="Discord 회원가입이 완료되었습니다"
                  />
                </div>
              </div>

              <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-lg mt-4">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">✅</div>
                  <div className="text-sm">
                    <div className="font-semibold mb-1">Discord 가입 완료 후</div>
                    <div className="text-muted-foreground">
                      Discord 계정만 있으면 LOD 포털에 바로 로그인할 수 있습니다!
                      <br />
                      아래 'LOD 포털 시작하기' 순서대로 진행하세요.
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">⚠️</div>
                  <div className="text-sm">
                    <div className="font-semibold mb-1">중요 안내</div>
                    <div className="text-muted-foreground space-y-1">
                      <div>• 비밀번호는 반드시 기억해두세요 (분실 시 이메일로 재설정)</div>
                      <div>• 이메일 주소는 정확하게 입력하세요 (인증 메일 받아야 함)</div>
                      <div>• 사용자 이름은 나중에 변경 가능합니다</div>
                      <div>• Discord 앱 설치는 선택사항입니다 (웹에서도 사용 가능)</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold mb-2">✨ 주요 기능</h3>
            <div className="grid gap-3">
              <FeatureCard
                icon={Users}
                title="파티 모집"
                description="혼돈의 탑, 길드전 등 파티원을 쉽게 모집하고 참가할 수 있습니다"
              />
              <FeatureCard
                icon={ShoppingBag}
                title="거래소"
                description="아이템을 사고팔 수 있는 거래 게시판입니다"
              />
              <FeatureCard
                icon={Bell}
                title="실시간 알림"
                description="파티 신청, 거래 예약 등을 브라우저 또는 Discord로 알림받습니다"
              />
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold text-lg mb-3">🚀 LOD 포털 시작하기</h3>
            <div className="space-y-4">
              <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg">
                <div className="text-sm">
                  <div className="font-semibold mb-2">1단계: LOD 포털 로그인</div>
                  <div className="space-y-2 pl-4 border-l-2 border-primary/30">
                    <Step
                      number={1}
                      title="LOD 포털 접속"
                      description="인터넷 주소창에 LOD 포털 주소 입력"
                    />
                    <Step
                      number={2}
                      title="로그인 버튼 찾기"
                      description="화면 우측 상단의 '로그인' 버튼 클릭"
                    />
                    <Step
                      number={3}
                      title="Discord로 계속하기"
                      description="'Discord로 로그인' 버튼 클릭 (새 창 열림)"
                    />
                    <Step
                      number={4}
                      title="Discord 로그인"
                      description="Discord 이메일과 비밀번호 입력 후 로그인"
                    />
                    <Step
                      number={5}
                      title="권한 승인"
                      description="'승인' 버튼을 클릭하여 LOD 포털에 권한 허용"
                    />
                    <Step
                      number={6}
                      title="로그인 완료!"
                      description="자동으로 LOD 포털로 돌아오며 로그인됩니다"
                    />
                  </div>
                  <div className="mt-3 p-3 bg-muted rounded">
                    <div className="text-xs text-muted-foreground">
                      💡 <strong>권한 승인이란?</strong> LOD 포털이 회원님의 Discord 이름과 프로필 사진을 사용할 수 있도록 허용하는 것입니다.
                      메시지를 보내거나 개인정보를 수집하지 않으니 안심하세요.
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <div className="text-sm space-y-2">
                  <div className="font-medium">📷 이미지 필요:</div>
                  <div className="text-muted-foreground">
                    • LOD 포털 메인 화면 (로그인 버튼 표시)
                    <br />• Discord 로그인 화면
                    <br />• Discord 권한 승인 화면
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="font-semibold">2단계: 프로필 설정 (선택사항)</div>
                <div className="text-sm text-muted-foreground pl-4">
                  로그인 후 우측 상단 프로필 메뉴 → '프로필'에서 게임 닉네임과 직업을 설정할 수 있습니다.
                  <br />
                  설정하지 않아도 사용할 수 있지만, 설정하면 다른 유저들이 알아보기 쉽습니다.
                </div>
              </div>

              <div className="space-y-2">
                <div className="font-semibold">3단계: 알림 설정 (선택사항)</div>
                <div className="text-sm text-muted-foreground pl-4">
                  프로필 → 알림 설정에서 브라우저 알림을 켜면 파티 신청, 거래 예약 등을 실시간으로 알림받을 수 있습니다.
                  <br />
                  자세한 방법은 '알림 설정' 탭을 참고하세요.
                </div>
              </div>

              <div className="space-y-2">
                <div className="font-semibold">4단계: 자유롭게 사용하기!</div>
                <div className="text-sm text-muted-foreground pl-4">
                  • <strong>파티 모집</strong>: 파티원 모집 또는 참가
                  <br />
                  • <strong>거래소</strong>: 아이템 사고팔기
                  <br />
                  • <strong>라르 계산기</strong>: 경험치 계산
                  <br />
                  • <strong>DB 검색</strong>: 아이템/스킬 정보 찾기
                </div>
              </div>

              <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">🎉</div>
                  <div className="text-sm">
                    <div className="font-semibold mb-1">축하합니다!</div>
                    <div className="text-muted-foreground">
                      LOD 포털 사용 준비가 완료되었습니다.
                      <br />
                      파티 모집, 거래소 등 원하는 기능을 자유롭게 이용하세요!
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div className="bg-muted p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="text-2xl">💡</div>
              <div>
                <div className="font-semibold mb-1">카카오톡 오픈채팅과의 차이점</div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• 파티/거래가 게시판 형태로 깔끔하게 정리됩니다</li>
                  <li>• 메시지가 뒤섞이지 않고 체계적으로 관리됩니다</li>
                  <li>• 실시간 알림으로 놓치지 않고 확인할 수 있습니다</li>
                  <li>• 검색, 필터링으로 원하는 정보를 쉽게 찾을 수 있습니다</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ============================================
// 알림 설정 가이드
// ============================================

function NotificationGuide() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>알림 시스템 설정</CardTitle>
          <CardDescription>
            3가지 방법으로 실시간 알림을 받을 수 있습니다
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* 웹사이트 알림 */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Badge>기본</Badge>
              <h3 className="font-semibold text-lg">1. 웹사이트 알림 (기본)</h3>
            </div>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                우측 상단의 🔔 알림벨에서 모든 알림을 확인할 수 있습니다. 추가 설정이 필요 없습니다.
              </p>
              <div className="bg-muted p-4 rounded-lg">
                <div className="text-sm space-y-2">
                  <div className="font-medium">📷 이미지 필요:</div>
                  <div className="text-muted-foreground">
                    • 헤더 우측 상단 알림벨 아이콘 스크린샷
                    <br />• 알림벨 클릭 시 드롭다운 메뉴 스크린샷
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* 브라우저 푸시 알림 */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="outline">권장</Badge>
              <h3 className="font-semibold text-lg">2. 브라우저 푸시 알림 (권장)</h3>
            </div>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                웹사이트를 안 켜놔도 알림을 받을 수 있습니다. 대부분의 사용자에게 권장합니다.
              </p>

              <div className="space-y-3">
                <div className="font-medium text-sm">설정 방법:</div>
                <div className="space-y-2 pl-4 border-l-2 border-primary/30">
                  <Step
                    number={1}
                    title="프로필 페이지 접속"
                    description="우측 상단 프로필 메뉴 → '프로필' 클릭"
                  />
                  <Step
                    number={2}
                    title="알림 설정 탭 선택"
                    description="프로필 페이지에서 '알림 설정' 탭 클릭"
                  />
                  <Step
                    number={3}
                    title="브라우저 알림 권한 허용"
                    description="'브라우저 알림 권한 요청' 버튼 클릭 → 허용"
                  />
                  <Step
                    number={4}
                    title="알림 타입 선택"
                    description="받고 싶은 알림 타입을 선택하고 저장"
                  />
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <div className="text-sm space-y-2">
                  <div className="font-medium">📷 이미지 필요:</div>
                  <div className="text-muted-foreground">
                    • 프로필 페이지의 알림 설정 탭 스크린샷
                    <br />• 브라우저 알림 권한 요청 팝업 스크린샷
                    <br />• 알림 타입 선택 체크박스 스크린샷
                  </div>
                </div>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">ℹ️</div>
                  <div className="text-sm">
                    <div className="font-semibold mb-1">브라우저별 알림 지원</div>
                    <div className="text-muted-foreground space-y-1">
                      <div>• Chrome, Edge: 완벽 지원 ✅</div>
                      <div>• Firefox: 완벽 지원 ✅</div>
                      <div>• Safari: macOS/iOS 16+ 지원 ✅</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Discord 웹훅 */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="outline">선택</Badge>
              <h3 className="font-semibold text-lg">3. Discord 웹훅 (선택사항)</h3>
            </div>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Discord를 자주 사용하는 분들을 위한 옵션입니다. Discord 채널로 알림을 받을 수 있습니다.
              </p>

              <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">⚠️</div>
                  <div className="text-sm">
                    <div className="font-semibold mb-1">중요: 개인용 설정입니다</div>
                    <div className="text-muted-foreground">
                      Discord 웹훅은 <strong>각 유저가 개인적으로 설정</strong>하는 것입니다.
                      <br />
                      커뮤니티 채널이 아니라 <strong>나한테만 오는 개인 알림</strong>입니다.
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="font-medium text-sm">A. Discord 웹훅 생성 방법:</div>
                <div className="space-y-2 pl-4 border-l-2 border-primary/30">
                  <Step
                    number={1}
                    title="Discord 서버 선택"
                    description="기존 서버 또는 개인 알림용 서버 생성 (추천)"
                  />
                  <Step
                    number={2}
                    title="알림 받을 채널 선택"
                    description="예: #lod-알림 채널 생성"
                  />
                  <Step
                    number={3}
                    title="채널 설정 열기"
                    description="채널 이름 옆 톱니바퀴 아이콘 클릭"
                  />
                  <Step
                    number={4}
                    title="연동 메뉴 선택"
                    description="'연동' 또는 'Integrations' 메뉴 클릭"
                  />
                  <Step
                    number={5}
                    title="웹훅 생성"
                    description="'웹훅' → '새 웹훅' 버튼 클릭"
                  />
                  <Step
                    number={6}
                    title="웹훅 이름 설정"
                    description="예: 'LOD 포털 알림'"
                  />
                  <Step
                    number={7}
                    title="URL 복사"
                    description="'웹훅 URL 복사' 버튼 클릭하여 URL 복사"
                  />
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <div className="text-sm space-y-2">
                  <div className="font-medium">📷 이미지 필요 (Discord 스크린샷):</div>
                  <div className="text-muted-foreground space-y-1">
                    • Discord 채널 설정 → 연동 메뉴 스크린샷
                    <br />• 웹훅 생성 화면 스크린샷
                    <br />• 웹훅 URL 복사 버튼 스크린샷
                  </div>
                </div>
              </div>

              <div className="space-y-3 mt-4">
                <div className="font-medium text-sm">B. LOD 포털에 웹훅 설정:</div>
                <div className="space-y-2 pl-4 border-l-2 border-primary/30">
                  <Step
                    number={1}
                    title="프로필 → 알림 설정"
                    description="프로필 페이지의 알림 설정 탭 이동"
                  />
                  <Step
                    number={2}
                    title="Discord 웹훅 섹션"
                    description="'Discord 웹훅 URL' 입력란 찾기"
                  />
                  <Step
                    number={3}
                    title="URL 붙여넣기"
                    description="복사한 Discord 웹훅 URL 붙여넣기"
                  />
                  <Step
                    number={4}
                    title="알림 타입 선택"
                    description="Discord로 받을 알림 타입 선택"
                  />
                  <Step
                    number={5}
                    title="저장"
                    description="'저장' 버튼 클릭하여 설정 완료"
                  />
                </div>
              </div>

              <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">✅</div>
                  <div className="text-sm">
                    <div className="font-semibold mb-1">테스트 방법</div>
                    <div className="text-muted-foreground">
                      프로필 페이지에서 '테스트 알림 전송' 버튼을 클릭하면
                      <br />
                      Discord 채널에 테스트 메시지가 전송됩니다.
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">🔒</div>
                  <div className="text-sm">
                    <div className="font-semibold mb-1">보안 주의사항</div>
                    <div className="text-muted-foreground space-y-1">
                      <div>• 웹훅 URL은 절대 다른 사람과 공유하지 마세요</div>
                      <div>• URL을 아는 사람은 누구나 메시지를 보낼 수 있습니다</div>
                      <div>• 의심스러운 메시지가 오면 웹훅을 재생성하세요</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* 알림 타입 설명 */}
          <div>
            <h3 className="font-semibold text-lg mb-3">📬 알림 타입 설명</h3>
            <div className="space-y-2">
              <NotificationTypeCard
                emoji="👥"
                title="파티 신청"
                description="내가 만든 파티 모집글에 누군가 참가 신청을 했을 때"
              />
              <NotificationTypeCard
                emoji="✅"
                title="파티 승인"
                description="내가 신청한 파티에 승인되었을 때"
              />
              <NotificationTypeCard
                emoji="❌"
                title="파티 거절"
                description="내가 신청한 파티에 거절되었을 때"
              />
              <NotificationTypeCard
                emoji="🚫"
                title="파티 추방"
                description="참가 중인 파티에서 추방되었을 때"
              />
              <NotificationTypeCard
                emoji="💰"
                title="거래 예약"
                description="내가 올린 거래글에 예약이 들어왔을 때"
              />
              <NotificationTypeCard
                emoji="💬"
                title="거래 댓글"
                description="내 거래글에 댓글이 달렸을 때"
              />
              <NotificationTypeCard
                emoji="⚠️"
                title="사기 신고 결과"
                description="내가 신고한 사기 건의 처리 결과가 나왔을 때"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ============================================
// 파티 모집 가이드
// ============================================

function PartyGuide() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>파티 모집 사용법</CardTitle>
          <CardDescription>
            파티원을 모집하거나 참가하는 방법을 안내합니다
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* 파티 모집하기 */}
          <div>
            <h3 className="font-semibold text-lg mb-4">📝 파티 모집하기</h3>
            <div className="space-y-2 pl-4 border-l-2 border-primary/30">
              <Step
                number={1}
                title="파티 모집 페이지 접속"
                description="헤더 메뉴에서 '파티모집' 클릭"
              />
              <Step
                number={2}
                title="모집글 작성 버튼"
                description="우측 상단 '+ 모집글 작성' 버튼 클릭"
              />
              <Step
                number={3}
                title="모집 정보 입력"
                description="제목, 설명, 장소, 시간, 직업별 인원 등 입력"
              />
              <Step
                number={4}
                title="참가 방식 선택"
                description="승인제(내가 승인) 또는 선착순 선택"
              />
              <Step
                number={5}
                title="등록"
                description="'등록하기' 버튼 클릭하여 모집글 게시"
              />
            </div>

            <div className="mt-4 bg-muted p-4 rounded-lg">
              <div className="text-sm space-y-2">
                <div className="font-medium">📷 이미지 필요:</div>
                <div className="text-muted-foreground">
                  • 파티 모집 페이지 스크린샷
                  <br />• 모집글 작성 폼 스크린샷
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* 파티 참가하기 */}
          <div>
            <h3 className="font-semibold text-lg mb-4">🎯 파티 참가하기</h3>
            <div className="space-y-2 pl-4 border-l-2 border-primary/30">
              <Step
                number={1}
                title="모집글 찾기"
                description="파티 모집 목록에서 원하는 모집글 찾기 (필터 활용)"
              />
              <Step
                number={2}
                title="상세 보기"
                description="모집글 카드 클릭하여 상세 페이지 이동"
              />
              <Step
                number={3}
                title="참가 신청"
                description="'참가 신청' 버튼 클릭 후 직업, 캐릭터명 입력"
              />
              <Step
                number={4}
                title="승인 대기"
                description="승인제인 경우 모집자의 승인 대기, 선착순은 즉시 참가"
              />
              <Step
                number={5}
                title="알림 확인"
                description="승인/거절 결과를 알림으로 받음"
              />
            </div>
          </div>

          <Separator />

          {/* 파티 관리하기 */}
          <div>
            <h3 className="font-semibold text-lg mb-4">⚙️ 파티 관리하기 (모집자)</h3>
            <div className="space-y-3">
              <div className="text-sm text-muted-foreground">
                내가 만든 모집글의 상세 페이지에서 관리할 수 있습니다.
              </div>
              <div className="space-y-2">
                <ManageCard
                  title="신청자 승인/거절"
                  description="승인제로 설정한 경우, 신청자 목록에서 승인 또는 거절 가능"
                />
                <ManageCard
                  title="참가자 추방"
                  description="이미 참가한 멤버를 파티에서 제외 가능"
                />
                <ManageCard
                  title="모집 마감"
                  description="인원이 다 차거나 모집을 종료할 때 '마감하기' 버튼 클릭"
                />
                <ManageCard
                  title="모집글 삭제"
                  description="더 이상 필요 없는 모집글 삭제 가능"
                />
              </div>
            </div>
          </div>

          <Separator />

          <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="text-2xl">💡</div>
              <div className="text-sm">
                <div className="font-semibold mb-1">팁</div>
                <div className="text-muted-foreground space-y-1">
                  <div>• 제목은 간단명료하게 작성하세요 (예: "혼돈의 탑 전사 1명 구함")</div>
                  <div>• 시간을 정확히 입력하면 참가율이 높아집니다</div>
                  <div>• 요구사항이 있다면 설명란에 자세히 작성하세요</div>
                  <div>• 승인제는 신중하게 선택할 수 있고, 선착순은 빠르게 모집됩니다</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ============================================
// 거래소 가이드
// ============================================

function MarketGuide() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>거래소 사용법</CardTitle>
          <CardDescription>
            아이템을 사고파는 방법을 안내합니다
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* 판매글 등록 */}
          <div>
            <h3 className="font-semibold text-lg mb-4">💰 아이템 판매하기</h3>
            <div className="space-y-2 pl-4 border-l-2 border-primary/30">
              <Step
                number={1}
                title="거래소 페이지 접속"
                description="헤더 메뉴에서 '거래소' 클릭"
              />
              <Step
                number={2}
                title="거래글 작성 버튼"
                description="우측 상단 '+ 거래글 작성' 버튼 클릭"
              />
              <Step
                number={3}
                title="거래 정보 입력"
                description="아이템명, 카테고리, 가격, 수량, 설명 등 입력"
              />
              <Step
                number={4}
                title="가격 흥정 여부"
                description="'가격 흥정 가능' 체크박스 선택 (선택사항)"
              />
              <Step
                number={5}
                title="등록"
                description="'등록하기' 버튼 클릭하여 거래글 게시"
              />
            </div>

            <div className="mt-4 bg-muted p-4 rounded-lg">
              <div className="text-sm space-y-2">
                <div className="font-medium">📷 이미지 필요:</div>
                <div className="text-muted-foreground">
                  • 거래소 페이지 스크린샷
                  <br />• 거래글 작성 폼 스크린샷
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* 구매글 등록 */}
          <div>
            <h3 className="font-semibold text-lg mb-4">🛒 아이템 구매하기 (구매글 등록)</h3>
            <div className="space-y-3">
              <div className="text-sm text-muted-foreground">
                원하는 아이템을 찾지 못했다면 구매글을 등록할 수 있습니다.
              </div>
              <div className="space-y-2 pl-4 border-l-2 border-primary/30">
                <Step
                  number={1}
                  title="거래 유형 선택"
                  description="거래글 작성 시 '구매' 선택"
                />
                <Step
                  number={2}
                  title="구매 정보 입력"
                  description="원하는 아이템, 희망 가격, 수량 등 입력"
                />
                <Step
                  number={3}
                  title="등록"
                  description="구매글 게시 후 판매자 연락 대기"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* 거래 예약 */}
          <div>
            <h3 className="font-semibold text-lg mb-4">📌 거래 예약하기</h3>
            <div className="space-y-2 pl-4 border-l-2 border-primary/30">
              <Step
                number={1}
                title="거래글 찾기"
                description="거래소 목록에서 원하는 아이템 찾기 (필터/검색 활용)"
              />
              <Step
                number={2}
                title="상세 보기"
                description="거래글 카드 클릭하여 상세 페이지 이동"
              />
              <Step
                number={3}
                title="예약하기"
                description="'예약하기' 버튼 클릭"
              />
              <Step
                number={4}
                title="판매자 연락"
                description="판매자가 알림을 받고 Discord 등으로 연락 예정"
              />
              <Step
                number={5}
                title="거래 완료"
                description="게임 내에서 거래 진행 후 거래글 완료 처리"
              />
            </div>
          </div>

          <Separator />

          {/* 시세 확인 */}
          <div>
            <h3 className="font-semibold text-lg mb-4">📊 시세 확인하기</h3>
            <div className="space-y-3">
              <div className="text-sm text-muted-foreground">
                과거 거래 기록을 바탕으로 아이템 시세를 확인할 수 있습니다.
              </div>
              <div className="space-y-2">
                <ManageCard
                  title="평균 가격"
                  description="최근 거래된 평균 가격 확인"
                />
                <ManageCard
                  title="최저/최고 가격"
                  description="가격 범위를 참고하여 적정 가격 책정"
                />
                <ManageCard
                  title="거래량"
                  description="얼마나 자주 거래되는 아이템인지 확인"
                />
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="text-2xl">✅</div>
                <div className="text-sm">
                  <div className="font-semibold mb-1">거래 시 주의사항</div>
                  <div className="text-muted-foreground space-y-1">
                    <div>• 게임 내에서 직접 아이템/돈을 확인 후 거래하세요</div>
                    <div>• 의심스러운 거래는 피하세요</div>
                    <div>• 거래 완료 후 '거래 완료' 버튼을 눌러주세요</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="text-2xl">⚠️</div>
                <div className="text-sm">
                  <div className="font-semibold mb-1">사기 피해 방지</div>
                  <div className="text-muted-foreground space-y-1">
                    <div>• 게임 내에서 동시에 아이템/돈을 교환하세요</div>
                    <div>• 사기를 당했다면 즉시 신고하세요 (프로필 → 사기 신고)</div>
                    <div>• 블랙리스트에 등록된 유저는 거래하지 마세요</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ============================================
// 유틸 컴포넌트
// ============================================

function FeatureCard({ icon: Icon, title, description }: { icon: any; title: string; description: string }) {
  return (
    <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
      <Icon className="w-5 h-5 text-primary mt-0.5" />
      <div>
        <div className="font-medium text-sm">{title}</div>
        <div className="text-xs text-muted-foreground">{description}</div>
      </div>
    </div>
  )
}

function Step({ number, title, description }: { number: number; title: string; description: string }) {
  return (
    <div className="flex gap-3">
      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
        {number}
      </div>
      <div className="flex-1">
        <div className="font-medium text-sm">{title}</div>
        <div className="text-xs text-muted-foreground">{description}</div>
      </div>
    </div>
  )
}

function NotificationTypeCard({ emoji, title, description }: { emoji: string; title: string; description: string }) {
  return (
    <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
      <div className="text-xl">{emoji}</div>
      <div className="flex-1">
        <div className="font-medium text-sm">{title}</div>
        <div className="text-xs text-muted-foreground">{description}</div>
      </div>
    </div>
  )
}

function ManageCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="p-3 bg-muted rounded-lg">
      <div className="font-medium text-sm">{title}</div>
      <div className="text-xs text-muted-foreground">{description}</div>
    </div>
  )
}
