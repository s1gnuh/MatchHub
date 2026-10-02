import { Link } from 'react-router-dom'
import { FiAlertTriangle, FiClock, FiHeart, FiShield, FiUsers, FiZap } from 'react-icons/fi'
import { SOCIALS } from '../components/Header.jsx'
import { useLang } from '../utils/i18n.jsx'

const VALUE_ICONS = [FiClock, FiZap, FiShield, FiUsers]

const CONTENT = {
  en: {
    eyebrow: 'About us',
    title: 'Football schedules, nothing else.',
    lead: 'MatchHub is a small, independent website made by a football fan for football fans. It shows fixtures, results, tables, top scorers and squads in Hanoi time, quickly and without clutter.',
    storyTitle: 'Why I built MatchHub',
    story: [
      'I watch a lot of football, and every week I caught myself asking the same simple question: who plays when, and what time is that in Vietnam?',
      'Getting the answer was always more work than it should be. I had to open a big sports website, close a pop-up or two, scroll past news, ads and, far too often, betting banners, then convert kickoff times from another timezone in my head. Doing that several times a day turned a small annoyance into a daily chore.',
      'What bothered me most were the betting ads. Football is about passion, skill and the people you watch it with, yet many sites that show a simple fixture list push odds and "tips" right next to it. I wanted a place where a fan can check the schedule without being nudged towards gambling.',
      'So I built the app I wanted: one clean page that opens fast, shows only football information and already speaks Hanoi time. Pick a league, glance at the schedule, done. It also became my way of learning to build a real product from start to finish, and I am sharing it in case it saves you the same daily detour.',
    ],
    valuesTitle: 'What MatchHub stands for',
    values: [
      { title: 'Hanoi time first', text: 'Every kickoff time and date is shown in Hanoi time (GMT+7), wherever you open the site. No mental maths before a late-night match.' },
      { title: 'Fast and clean', text: 'No news feeds, no pop-ups, no ads. Just fixtures, results, standings, scorers and squads, cached so coming back is instant.' },
      { title: 'Free and private', text: 'No sign-up, no payments and no tracking scripts. The only things stored are your language choice and cached match data, and they stay in your own browser.' },
      { title: 'Made for fans', text: 'Built for people who love the game: following their club, planning a weekend of football or settling a friendly debate about the table.' },
    ],
    disclaimerTitle: 'Disclaimer',
    disclaimerLead: 'MatchHub is a football schedule website for ordinary fans. Please read the points below so the purpose of the site is perfectly clear.',
    disclaimer: [
      { title: 'No betting, no gambling', text: 'MatchHub does not organise, operate, broker or promote football betting or any other form of gambling. The site shows no betting odds, gives no betting tips or predictions, and does not link to or advertise betting sites or casinos.' },
      { title: 'No money involved', text: 'The site sells nothing, takes no deposits and handles no payments. Nobody can place a bet, win or lose money on MatchHub.' },
      { title: 'Respecting the law', text: 'I respect the laws of Vietnam, where gambling and organising gambling are criminal offences (Articles 321 and 322 of the 2015 Penal Code). MatchHub must not be used for any illegal purpose, and I do not support anyone who uses football information for illegal betting.' },
      { title: 'Information only', text: 'Fixtures, results and statistics come from the public football-data.org API and are provided "as is" for information and entertainment. They can be delayed or contain mistakes, so for anything important please check the official sources of the leagues and clubs.' },
      { title: 'Independent fan project', text: 'MatchHub is a personal, non-commercial project. It is not affiliated with, endorsed or sponsored by any league, club, federation or football-data.org. Club names, crests and league logos belong to their respective owners and are shown only to identify teams and competitions.' },
      { title: 'External links', text: 'Links to other websites (the data source, social profiles, club websites) are provided for convenience. I am not responsible for their content.' },
    ],
    help: 'Football should bring joy, not debt or stress. If betting is affecting you or someone close to you, please talk to family, friends or a health professional and seek support early.',
    closingTitle: 'From one fan to another',
    closing: 'Thank you for using MatchHub. Whether you support a Premier League giant or a small club in the Eredivisie, I hope this page makes following the game a little easier. Enjoy the football, cheer loudly and keep it clean.',
    sign: 's1gnuh, creator of MatchHub',
    contact: 'Questions, ideas or found a bug? Reach me here:',
  },
  vi: {
    eyebrow: 'Giới thiệu',
    title: 'Lịch bóng đá, và chỉ vậy thôi.',
    lead: 'MatchHub là một trang web nhỏ, độc lập, do một người hâm mộ bóng đá làm ra cho những người hâm mộ bóng đá. Trang hiển thị lịch thi đấu, kết quả, bảng xếp hạng, vua phá lưới và đội hình theo giờ Hà Nội, nhanh gọn và không rườm rà.',
    storyTitle: 'Vì sao tôi làm MatchHub',
    story: [
      'Tôi xem bóng đá rất nhiều, và tuần nào tôi cũng tự hỏi mình cùng một câu đơn giản: trận nào đá lúc nào, và đó là mấy giờ ở Việt Nam?',
      'Tìm được câu trả lời lúc nào cũng mất công hơn mức cần thiết. Tôi phải mở một trang thể thao lớn, tắt vài cửa sổ pop-up, cuộn qua tin tức, quảng cáo và rất thường xuyên là cả banner cá cược, rồi tự nhẩm đổi giờ bóng lăn từ múi giờ khác. Làm vậy vài lần mỗi ngày, một phiền toái nhỏ dần thành một việc vặt mệt mỏi.',
      'Điều khiến tôi khó chịu nhất là quảng cáo cá cược. Bóng đá là đam mê, là kỹ thuật, là những người cùng ngồi xem với mình, vậy mà nhiều trang chỉ hiển thị một danh sách lịch thi đấu đơn giản cũng chèn tỷ lệ kèo và "tips" ngay bên cạnh. Tôi muốn có một nơi mà người hâm mộ xem lịch thi đấu mà không bị lôi kéo về phía cờ bạc.',
      'Vì vậy tôi tự làm ứng dụng mà mình mong muốn: một trang gọn gàng, mở nhanh, chỉ có thông tin bóng đá và dùng sẵn giờ Hà Nội. Chọn giải, lướt qua lịch, xong. Đây cũng là cách tôi học xây dựng một sản phẩm thực tế từ đầu đến cuối, và tôi chia sẻ nó với hy vọng giúp bạn bớt đi những bước vòng vèo như tôi từng gặp.',
    ],
    valuesTitle: 'MatchHub hướng đến điều gì',
    values: [
      { title: 'Giờ Hà Nội là mặc định', text: 'Mọi giờ bóng lăn và ngày thi đấu đều hiển thị theo giờ Hà Nội (GMT+7), dù bạn mở trang ở đâu. Không cần nhẩm giờ trước mỗi trận đêm khuya.' },
      { title: 'Nhanh và gọn', text: 'Không tin tức, không pop-up, không quảng cáo. Chỉ có lịch thi đấu, kết quả, bảng xếp hạng, vua phá lưới và đội hình, được lưu tạm để lần sau mở lại ngay lập tức.' },
      { title: 'Miễn phí và riêng tư', text: 'Không cần đăng ký, không thanh toán, không có script theo dõi. Thứ duy nhất được lưu là ngôn ngữ bạn chọn và dữ liệu trận đấu tạm thời, và chúng nằm ngay trong trình duyệt của bạn.' },
      { title: 'Dành cho người hâm mộ', text: 'Làm ra cho những người yêu bóng đá: theo dõi đội bóng mình thích, lên kế hoạch cho một cuối tuần xem bóng, hay phân xử một cuộc tranh luận vui về bảng xếp hạng.' },
    ],
    disclaimerTitle: 'Tuyên bố miễn trừ trách nhiệm',
    disclaimerLead: 'MatchHub là trang web xem lịch bóng đá dành cho người hâm mộ thông thường. Vui lòng đọc các điểm dưới đây để hiểu rõ mục đích của trang.',
    disclaimer: [
      { title: 'Không cá độ, không cờ bạc', text: 'MatchHub không tổ chức, vận hành, môi giới hay quảng bá cá độ bóng đá hoặc bất kỳ hình thức cờ bạc nào. Trang không hiển thị tỷ lệ kèo, không đưa ra "tips" hay dự đoán phục vụ cá cược, và không liên kết hay quảng cáo cho bất kỳ trang cá cược hoặc sòng bạc nào.' },
      { title: 'Không có giao dịch tiền bạc', text: 'Trang không bán gì, không nhận nạp tiền và không xử lý bất kỳ khoản thanh toán nào. Không ai có thể đặt cược, thắng hay thua tiền trên MatchHub.' },
      { title: 'Tôn trọng pháp luật', text: 'Tôi tôn trọng pháp luật Việt Nam, nơi hành vi đánh bạc và tổ chức đánh bạc là tội phạm (Điều 321 và Điều 322 Bộ luật Hình sự năm 2015). Không được sử dụng MatchHub cho bất kỳ mục đích trái pháp luật nào, và tôi không ủng hộ bất kỳ ai dùng thông tin bóng đá để cá độ bất hợp pháp.' },
      { title: 'Chỉ mang tính thông tin', text: 'Lịch thi đấu, kết quả và số liệu được lấy từ API công khai của football-data.org và được cung cấp "nguyên trạng" nhằm mục đích thông tin và giải trí. Dữ liệu có thể bị chậm hoặc có sai sót, vì vậy với những việc quan trọng, hãy kiểm tra lại nguồn chính thức từ các giải đấu và câu lạc bộ.' },
      { title: 'Dự án cá nhân, độc lập', text: 'MatchHub là dự án cá nhân, phi thương mại. Trang không liên kết, không được bảo trợ hay tài trợ bởi bất kỳ giải đấu, câu lạc bộ, liên đoàn nào hay football-data.org. Tên câu lạc bộ, logo đội bóng và logo giải đấu thuộc về chủ sở hữu tương ứng và chỉ được hiển thị để nhận diện đội bóng, giải đấu.' },
      { title: 'Liên kết bên ngoài', text: 'Các liên kết đến trang web khác (nguồn dữ liệu, mạng xã hội, trang web câu lạc bộ) chỉ nhằm tiện cho bạn. Tôi không chịu trách nhiệm về nội dung của các trang đó.' },
    ],
    help: 'Bóng đá nên mang lại niềm vui, không phải nợ nần hay căng thẳng. Nếu cá cược đang ảnh hưởng đến bạn hoặc người thân, hãy chia sẻ với gia đình, bạn bè hoặc chuyên gia y tế và tìm sự hỗ trợ càng sớm càng tốt.',
    closingTitle: 'Từ một người hâm mộ, gửi những người hâm mộ',
    closing: 'Cảm ơn bạn đã sử dụng MatchHub. Dù bạn cổ vũ một ông lớn Ngoại hạng Anh hay một đội bóng nhỏ ở Eredivisie, tôi hy vọng trang này giúp việc theo dõi bóng đá dễ dàng hơn một chút. Hãy tận hưởng bóng đá, cổ vũ hết mình và giữ cho trận cầu luôn trong sạch.',
    sign: 's1gnuh, người tạo ra MatchHub',
    contact: 'Có câu hỏi, ý tưởng hay phát hiện lỗi? Liên hệ với tôi tại đây:',
  },
}

// About page: why the site exists, what it stands for, and a clear no-betting / no-gambling disclaimer.
export default function About() {
  const { lang, t } = useLang()
  const c = CONTENT[lang]

  return (
    <div className="mx-auto max-w-4xl space-y-10">
      <header className="animate-fade-in rounded-xl border-l-4 border-primary bg-card p-6 shadow-sm sm:p-8">
        <p className="text-xs font-bold uppercase tracking-widest text-primary">{c.eyebrow}</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">{c.title}</h1>
        <p className="mt-3 leading-relaxed text-muted sm:text-lg">{c.lead}</p>
      </header>

      <section className="animate-fade-in">
        <h2 className="mb-4 text-2xl font-extrabold">{c.storyTitle}</h2>
        <div className="space-y-4 leading-relaxed text-main/90">
          {c.story.map((p, i) => <p key={i}>{p}</p>)}
        </div>
      </section>

      <section className="animate-fade-in">
        <h2 className="mb-4 text-2xl font-extrabold">{c.valuesTitle}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {c.values.map((v, i) => {
            const Icon = VALUE_ICONS[i]
            return (
              <div key={i} className="rounded-xl bg-card p-5 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/10">
                <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-primary"><Icon size={20} /></span>
                <h3 className="font-bold">{v.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted">{v.text}</p>
              </div>
            )
          })}
        </div>
      </section>

      <section className="animate-fade-in rounded-xl border border-primary/40 bg-primary/5 p-5 sm:p-7">
        <div className="mb-2 flex items-center gap-3">
          <FiAlertTriangle size={24} className="shrink-0 text-primary" />
          <h2 className="text-2xl font-extrabold">{c.disclaimerTitle}</h2>
        </div>
        <p className="mb-6 leading-relaxed text-main/90">{c.disclaimerLead}</p>
        <ol className="space-y-5">
          {c.disclaimer.map((d, i) => (
            <li key={i} className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-black">{i + 1}</span>
              <div>
                <h3 className="font-bold">{d.title}</h3>
                <p className="mt-0.5 text-sm leading-relaxed text-muted">{d.text}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-6 flex gap-3 rounded-lg bg-card p-4 text-sm leading-relaxed">
          <FiHeart size={18} className="mt-0.5 shrink-0 text-red-400" />
          <span>{c.help}</span>
        </p>
      </section>

      <section className="animate-fade-in rounded-xl bg-card p-6 text-center shadow-sm sm:p-8">
        <h2 className="text-2xl font-extrabold">{c.closingTitle}</h2>
        <p className="mx-auto mt-3 max-w-2xl leading-relaxed text-muted">{c.closing}</p>
        <p className="mt-4 font-semibold italic text-primary">— {c.sign}</p>
        <p className="mt-6 text-sm text-muted">{c.contact}</p>
        <div className="mt-3 flex justify-center gap-2">
          {SOCIALS.map(({ name, href, Icon }) => (
            <a key={name} href={href} target="_blank" rel="noreferrer" aria-label={name} title={name}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-main/80 transition duration-300 hover:-translate-y-0.5 hover:border-primary hover:bg-primary hover:text-black">
              <Icon size={16} />
            </a>
          ))}
        </div>
        <Link to="/" className="mt-6 inline-block rounded-full bg-primary px-6 py-2.5 font-semibold text-black transition hover:bg-primary-dark">
          {t('nf.back')}
        </Link>
      </section>
    </div>
  )
}
