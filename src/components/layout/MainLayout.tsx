import { Outlet } from 'react-router-dom'
import TopNav from './TopNav'

export default function MainLayout() {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <TopNav />
      <main className="flex-1 overflow-auto relative">
        <div
          className="fixed inset-0 top-14 z-0"
          style={{
            backgroundImage: `url(${import.meta.env.BASE_URL}page-bg.png)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        />
        <div className="fixed inset-0 top-14 z-[1] bg-white/15" />
        <div className="relative z-10">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
