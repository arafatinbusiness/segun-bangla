import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-foreground text-background py-12 mt-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* About */}
          <div>
            <h4 className="font-bold text-lg mb-4">সেগুন বাংলা সম্পর্কে</h4>
            <p className="text-sm text-background/80">
              সেগুন বাংলা বাংলাদেশের অগ্রণী সংবাদ পোর্টাল, যেখানে আপনি পাবেন দেশি-বিদেশি সর্বশেষ সংবাদ।
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-lg mb-4">দ্রুত লিঙ্ক</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:underline text-background/80 hover:text-background">
                  হোম
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:underline text-background/80 hover:text-background">
                  সম্পর্কে আমাদের
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:underline text-background/80 hover:text-background">
                  যোগাযোগ করুন
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:underline text-background/80 hover:text-background">
                  বিজ্ঞাপন
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-bold text-lg mb-4">বিভাগ</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="hover:underline text-background/80 hover:text-background">
                  রাজনীতি
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:underline text-background/80 hover:text-background">
                  ক্রীড়া
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:underline text-background/80 hover:text-background">
                  বিনোদন
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:underline text-background/80 hover:text-background">
                  প্রযুক্তি
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-bold text-lg mb-4">আইনি</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="hover:underline text-background/80 hover:text-background">
                  গোপনীয়তা নীতি
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:underline text-background/80 hover:text-background">
                  শর্তাবলী
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:underline text-background/80 hover:text-background">
                  কুকি নীতি
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-background/20 pt-8 text-center text-sm text-background/70">
          <p>&copy; {new Date().getFullYear()} সেগুন বাংলা। সর্বাধিকার সংরক্ষিত।</p>
        </div>
      </div>
    </footer>
  )
}
