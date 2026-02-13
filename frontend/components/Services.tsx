import { Shield, Clock, HeartHandshake } from "lucide-react";

export function Services() {
    const services = [
        {
            icon: Clock,
            title: "24/7 Support",
            description: "Our team is available round the clock to assist you with your booking or on-road needs."
        },
        {
            icon: Shield,
            title: "Premium Fleet",
            description: "Every vehicle is rigorously inspected and maintained to showroom standards for your safety."
        },
        {
            icon: HeartHandshake,
            title: "Concierge Service",
            description: "Need a driver? Airport transfer? We offer tailored solutions to make your trip effortless."
        }
    ];

    return (
        <section className="py-24 bg-white">
            <div className="container mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Our Services</h2>
                    <p className="mt-4 text-muted-foreground">More than just a rental. A complete mobility experience.</p>
                </div>

                <div className="grid gap-8 md:grid-cols-3">
                    {services.map((service, index) => (
                        <div key={index} className="flex flex-col items-center text-center p-6 rounded-2xl border border-transparent hover:border-gray-100 hover:shadow-lg transition-all">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-6">
                                <service.icon className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">{service.title}</h3>
                            <p className="text-muted-foreground">{service.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
