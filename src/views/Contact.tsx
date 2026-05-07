"use client";

import React, { useEffect } from "react";
import { FiArrowRight, FiMapPin, FiPhone, FiMail } from "react-icons/fi";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { SectionHeader } from "@/components/ui/SectionHeader";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useCatalogCoursesList } from "@/hooks/use-catalog-courses";

const formSchema = z.object({
  name: z.string().min(2, { message: "Required." }),
  email: z.string().email({ message: "Invalid email." }),
  company: z.string().min(2, { message: "Required." }),
  inquiryType: z.string().min(1, { message: "Required." }),
  message: z.string().min(10, { message: "Required." }),
});

export default function Contact() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const { catalogCourses: courses } = useCatalogCoursesList();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      company: "",
      inquiryType: "General Inquiry",
      message: "",
    },
  });

  useEffect(() => {
    const courseSlug = searchParams.get("course");
    if (!courseSlug) return;

    const course = courses.find((c) => c.slug === courseSlug);
    const title = course?.title ?? courseSlug;
    const intent = searchParams.get("intent") ?? "enroll";
    const origin =
      typeof window !== "undefined" ? window.location.origin : "";
    const programUrl = `${origin}/courses/${encodeURIComponent(courseSlug)}`;

    if (intent === "corporate") {
      form.setValue("inquiryType", "Corporate Training");
      form.setValue(
        "message",
        `Corporate booking inquiry for: ${title}.\nProgram page: ${programUrl}\n\nPreferred dates, headcount, and delivery format (on-site / hybrid / remote):\n`,
      );
    } else {
      form.setValue("inquiryType", "Course Enrollment");
      form.setValue(
        "message",
        `I would like to enroll in: ${title}.\nProgram page: ${programUrl}\n\nPreferred intake dates or questions:\n`,
      );
    }
  }, [searchParams, form, courses]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    toast({
      title: "Message Sent",
      description: "A representative will contact you within 24 hours.",
    });
    form.reset();
  }

  return (
    <div className="min-h-screen bg-background pt-32 pb-32">
      <div className="container mx-auto px-6">
        <div className="mb-16">
           <SectionHeader 
             eyebrow="Communications"
             title="Get in touch"
             description="Contact our enterprise team to discuss your training and compliance requirements."
           />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
            
            {/* Form */}
            <div className="lg:col-span-7">
                <div className="bg-card border border-border rounded-2xl p-8 md:p-10 shadow-sm">
                  <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <FormField
                                  control={form.control}
                                  name="name"
                                  render={({ field }) => (
                                      <FormItem>
                                          <FormLabel>Full Name</FormLabel>
                                          <FormControl>
                                              <Input placeholder="John Doe" className="bg-background" {...field} />
                                          </FormControl>
                                          <FormMessage />
                                      </FormItem>
                                  )}
                              />
                              <FormField
                                  control={form.control}
                                  name="email"
                                  render={({ field }) => (
                                      <FormItem>
                                          <FormLabel>Work Email</FormLabel>
                                          <FormControl>
                                              <Input type="email" placeholder="john@company.com" className="bg-background" {...field} />
                                          </FormControl>
                                          <FormMessage />
                                      </FormItem>
                                  )}
                              />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                               <FormField
                                  control={form.control}
                                  name="company"
                                  render={({ field }) => (
                                      <FormItem>
                                          <FormLabel>Organization</FormLabel>
                                          <FormControl>
                                              <Input placeholder="Acme Corp" className="bg-background" {...field} />
                                          </FormControl>
                                          <FormMessage />
                                      </FormItem>
                                  )}
                              />
                              <FormField
                                  control={form.control}
                                  name="inquiryType"
                                  render={({ field }) => (
                                      <FormItem>
                                          <FormLabel>Subject</FormLabel>
                                          <FormControl>
                                              <select 
                                                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                  {...field}
                                              >
                                                  <option value="General Inquiry">General Inquiry</option>
                                                  <option value="Course Enrollment">Course Enrollment</option>
                                                  <option value="Corporate Training">Corporate Training</option>
                                                  <option value="Consultancy Services">Consultancy Services</option>
                                              </select>
                                          </FormControl>
                                          <FormMessage />
                                      </FormItem>
                                  )}
                              />
                          </div>

                          <FormField
                              control={form.control}
                              name="message"
                              render={({ field }) => (
                                  <FormItem>
                                      <FormLabel>Message</FormLabel>
                                      <FormControl>
                                          <Textarea 
                                              placeholder="How can we help you?"
                                              className="min-h-[120px] bg-background resize-y" 
                                              {...field} 
                                          />
                                      </FormControl>
                                      <FormMessage />
                                  </FormItem>
                              )}
                          />
                          
                          <div className="pt-2">
                              <button type="submit" className="group flex items-center justify-center gap-2 w-full sm:w-auto bg-primary text-primary-foreground px-8 py-3 rounded-lg font-medium hover:bg-primary/90 transition-all hover-lift">
                                  <span>Send Message</span> <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                              </button>
                          </div>
                      </form>
                  </Form>
                </div>
            </div>

            {/* Information */}
            <div className="lg:col-span-5 space-y-8">
                <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <FiMapPin className="w-5 h-5" />
                      </div>
                      <h4 className="text-lg font-semibold text-foreground">Global Headquarters</h4>
                    </div>
                    <p className="text-muted-foreground leading-relaxed pl-14">
                        100 Enterprise Way, Suite 400<br />
                        Energy Corridor, TX 77002<br />
                        United States
                    </p>
                </div>

                <div className="bg-card border border-border rounded-2xl p-8 shadow-sm space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <FiPhone className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-muted-foreground">General Enquiries</div>
                        <div className="text-foreground font-medium">+1 800 555 0199</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <FiPhone className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-muted-foreground">Admissions</div>
                        <div className="text-foreground font-medium">+1 800 555 0198</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <FiMail className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-muted-foreground">Email</div>
                        <div className="text-foreground font-medium">contact@petrosphere.com</div>
                      </div>
                    </div>
                </div>

                <div className="bg-secondary/50 rounded-2xl p-8 text-center border border-border">
                    <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">Coordinates</span>
                    <span className="text-2xl font-semibold text-foreground tracking-tight">29.7604° N<br/>95.3698° W</span>
                </div>
            </div>
            
        </div>
      </div>
    </div>
  );
}