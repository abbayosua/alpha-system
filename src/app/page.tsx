'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Footer } from '@/components/layout/Footer';
import { 
  Users, 
  MapPin, 
  Camera, 
  Shield, 
  Wallet,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

const features = [
  {
    icon: MapPin,
    title: 'GPS Verification',
    description: 'Real-time location verification to ensure presence at the correct TPS',
  },
  {
    icon: Camera,
    title: 'Selfie Check-in',
    description: 'Check-in system with selfie photo for attendance validation',
  },
  {
    icon: Shield,
    title: 'Vote Input',
    description: 'Input vote count results with C1 document upload',
  },
  {
    icon: Shield,
    title: 'Fraud Reporting',
    description: 'Report violations or fraud with video evidence',
  },
  {
    icon: Wallet,
    title: 'Automatic Payment',
    description: 'Performance-based payment system with automatic validation',
  },
  {
    icon: Users,
    title: 'Multi-Role System',
    description: 'System with Admin, Finance Admin, and Witness roles',
  },
];

const benefits = [
  'GPS and photo verified attendance',
  'Real-time vote data input',
  'Video evidence fraud reporting',
  'Transparent performance-based payment',
  'Admin monitoring dashboard',
  'Complete activity audit trail',
];

export default function HomePage() {
  return (
    <PageWrapper>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-background via-background to-muted">
        <div className="container mx-auto px-4 py-20 lg:py-32">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <Shield className="h-4 w-4" />
                Trusted Election Witness Management
              </div>
              <div className="flex items-center justify-center lg:justify-start gap-4 mb-6">
                <img src="/logo.png" alt="Alpha System v5" className="w-16 h-16 object-contain" />
                <h1 className="text-4xl lg:text-6xl font-bold tracking-tight">
                  Alpha System v5
                </h1>
              </div>
              <p className="text-xl text-muted-foreground mb-8 max-w-xl">
                Integrated platform for election witness management with GPS verification, 
                real-time vote input, and performance-based payment system.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button asChild size="lg" className="gap-2">
                  <Link href="/auth/register">
                    Register as Witness
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/auth/login">Sign In</Link>
                </Button>
              </div>
            </div>
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/5 rounded-3xl blur-3xl" />
                <Card className="relative bg-card/80 backdrop-blur-sm border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <img src="/logo.png" alt="" className="w-5 h-5 object-contain" />
                      System Statistics
                    </CardTitle>
                    <CardDescription>Alpha System v5 real-time data</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg bg-muted">
                        <p className="text-2xl font-bold">1,234</p>
                        <p className="text-sm text-muted-foreground">Total Witnesses</p>
                      </div>
                      <div className="p-4 rounded-lg bg-muted">
                        <p className="text-2xl font-bold">567</p>
                        <p className="text-sm text-muted-foreground">Active TPS</p>
                      </div>
                      <div className="p-4 rounded-lg bg-muted">
                        <p className="text-2xl font-bold">89%</p>
                        <p className="text-sm text-muted-foreground">Check-in Rate</p>
                      </div>
                      <div className="p-4 rounded-lg bg-muted">
                        <p className="text-2xl font-bold">456</p>
                        <p className="text-sm text-muted-foreground">Data Submitted</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Key Features</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Complete system for managing election witnesses with high transparency and accountability
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="bg-card hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1">
              <h2 className="text-3xl lg:text-4xl font-bold mb-6">
                Why Choose Alpha System v5?
              </h2>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex-1">
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-6 text-center">
                  <p className="text-4xl font-bold text-primary mb-2">99%</p>
                  <p className="text-sm text-muted-foreground">Data Accuracy</p>
                </Card>
                <Card className="p-6 text-center">
                  <p className="text-4xl font-bold text-primary mb-2">24/7</p>
                  <p className="text-sm text-muted-foreground">System Access</p>
                </Card>
                <Card className="p-6 text-center">
                  <p className="text-4xl font-bold text-primary mb-2">100%</p>
                  <p className="text-sm text-muted-foreground">Transparency</p>
                </Card>
                <Card className="p-6 text-center">
                  <p className="text-4xl font-bold text-primary mb-2">Real-time</p>
                  <p className="text-sm text-muted-foreground">Monitoring</p>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Ready to Join as a Witness?
          </h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Register now and contribute to maintaining election transparency
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary" className="gap-2">
              <Link href="/auth/register">
                Register Now
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
              <Link href="/auth/login">Already Have an Account? Sign In</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </PageWrapper>
  );
}
