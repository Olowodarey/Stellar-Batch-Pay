import { LandingHero } from "@/components/landing-hero"
import { FeatureSection } from "@/components/feature-section"
import { HowItWorks } from "@/components/how-it-works"
import { CtaSection } from "@/components/cta-section"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function LandingPage() {
    return (
        <main className="min-h-screen bg-background text-foreground flex flex-col">
            <nav className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-50">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="font-bold text-xl flex items-center gap-2">
                        <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold">
                            B
                        </div>
                        Stellar BatchPay
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="https://github.com/jahrulezfrancis/Stellar-Batch-Pay" target="_blank" className="text-sm hover:underline hover:text-primary transition-colors hidden md:block">
                            GitHub
                        </Link>
                        <Link href="/demo">
                            <Button size="sm">Launch App</Button>
                        </Link>
                    </div>
                </div>
            </nav>

            <LandingHero />
            <HowItWorks />
            <FeatureSection />
            <CtaSection />

            <footer className="py-12 border-t mt-auto bg-secondary/10">
                <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="text-sm text-muted-foreground">
                        © 2024 Stellar BatchPay. Open Source.
                    </div>
                    <div className="flex gap-6 text-sm text-muted-foreground">
                        <Link href="#" className="hover:text-foreground">Privacy</Link>
                        <Link href="#" className="hover:text-foreground">Terms</Link>
                        <Link href="https://stellar.org" className="hover:text-foreground">Stellar.org</Link>
                    </div>
                </div>
            </footer>
        </main>
    )
}
