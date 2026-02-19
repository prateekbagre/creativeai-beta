import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center">
            <div className="max-w-2xl space-y-6">
                <h1 className="text-5xl font-black tracking-tight text-foreground sm:text-7xl">
                    Creative<span className="text-primary">AI</span>
                </h1>
                <p className="text-xl text-muted-foreground">
                    The premium AI creative studio. Generate, edit, and animate with ease.
                </p>
                <div className="flex items-center justify-center gap-4 pt-4">
                    <Button asChild size="lg" className="rounded-full px-8">
                        <Link href="/login">Get Started</Link>
                    </Button>
                    <Button asChild variant="outline" size="lg" className="rounded-full px-8">
                        <Link href="/signup">Sign Up</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
