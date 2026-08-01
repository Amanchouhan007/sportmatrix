import { Link } from 'react-router-dom'
import Button from '../components/ui/Button'

export default function NotFoundPage() {
    return (
        <div className="min-h-screen bg-surface-50 flex items-center justify-center p-8">
            <div className="text-center max-w-md">
                <p className="text-8xl font-bold text-primary-100 mb-4">404</p>
                <h1 className="text-2xl font-bold text-surface-900 mb-2">Page not found</h1>
                <p className="text-surface-500 mb-8">The page you&apos;re looking for doesn&apos;t exist or has been moved.</p>
                <Link to="/"><Button>Back to Home</Button></Link>
            </div>
        </div>
    )
}
