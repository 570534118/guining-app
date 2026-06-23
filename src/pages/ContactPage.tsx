import { Phone, Mail, Headset } from 'lucide-react'

export default function ContactPage() {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-500 mb-6">请联系我</h1>

      {/* 联系方式卡片 */}
      <div className="space-y-4">
        {/* 手机号 */}
        <div className="card p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
            <Phone size={22} />
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-1">手机号</p>
            <p className="text-lg font-semibold text-gray-500">138-xxxx-xxxx</p>
          </div>
        </div>

        {/* 邮箱 */}
        <div className="card p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
            <Mail size={22} />
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-1">联系邮箱</p>
            <p className="text-lg font-semibold text-gray-500">service@guining.com</p>
          </div>
        </div>

        {/* 客服 */}
        <div className="card p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
            <Headset size={22} />
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-1">客服微信</p>
            <p className="text-lg font-semibold text-gray-500">guining_service</p>
          </div>
        </div>
      </div>
    </div>
  )
}
