// app/features/contact/components/form.tsx


"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useNavigate, useParams } from "react-router-dom";

import {
  useSubmitContactMutation,
  useUpdateContactMutation,
  useGetContactByIdQuery,
} from "../data/contactApi";

import { RichTextEditor } from "~/components/crud/RichTextEditor";

/* -------------------------------------------------------------------------- */
/* 🧩 VALIDATION */
/* -------------------------------------------------------------------------- */
const validate = (values: any) => {
  const errors: Record<string, string> = {};

  if (!values.name.trim()) errors.name = "Name is required.";

  if (!values.email.trim()) errors.email = "Email is required.";
  else if (!/\S+@\S+\.\S+/.test(values.email))
    errors.email = "Enter a valid email address.";

  if (!values.message.trim()) errors.message = "Message is required.";
  else if (values.message.length < 10)
    errors.message = "Message must be at least 10 characters.";

  return errors;
};

/* -------------------------------------------------------------------------- */
/* 🧾 CONTACT FORM COMPONENT */
/* -------------------------------------------------------------------------- */
export default function ContactForm({
  mode = "create",
}: {
  mode?: "create" | "edit";
}) {
  const navigate = useNavigate();
  const { id = "" } = useParams<{ id: string }>();
  const isEdit = mode === "edit" || Boolean(id);

  /* API HOOKS (Correct ones from contactApi) */
  const { data: contactData, isLoading: loadingContact } =
    useGetContactByIdQuery(id, { skip: !isEdit });

  const [submitContact] = useSubmitContactMutation();
  const [updateContact] = useUpdateContactMutation();

  /* LOCAL STATE */
  const [values, setValues] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    status: "pending",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* PREFILL FORM IN EDIT MODE */
  useEffect(() => {
    if (isEdit && contactData?.data) {
      const c = contactData.data;

      setValues({
        name: c.name || "",
        email: c.email || "",
        phone: c.phone || "",
        subject: c.subject || "",
        message: c.message || "",
        status: c.status ?? "pending",
      });
    }
  }, [contactData, isEdit]);

  /* HANDLE INPUT CHANGE */
  const handleChange = (key: string, value: any) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  /* SUBMIT HANDLER */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validate(values);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error("Please correct the highlighted errors.");
      return;
    }

    const payload = {
      name: values.name.trim(),
      email: values.email.trim(),
      phone: values.phone.trim(),
      subject: values.subject.trim(),
      message: values.message,
      status: values.status,
    };

    setIsSubmitting(true);

    try {
      if (isEdit) {
        await updateContact({ id, data: payload }).unwrap();
        toast.success("Contact message updated successfully!");
      } else {
        await submitContact(payload).unwrap();
        toast.success("Message submitted successfully!");
      }

      navigate("/admin/contact");
    } catch (err: any) {
      toast.error(err?.data?.message || "Operation failed. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* LOADER FOR EDIT MODE */
  if (isEdit && loadingContact) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-2 text-sm text-muted-foreground">
          Loading contact message...
        </span>
      </div>
    );
  }

  /* -------------------------------------------------------------------------- */
  /* FORM UI — PRODUCTION-GRADE */
  /* -------------------------------------------------------------------------- */
  return (
    <div className="p-6 w-full mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-semibold">
          {isEdit ? "Edit Contact Message" : "Submit Contact Message"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isEdit
            ? "Update this contact message below."
            : "Fill out the form to submit a new message."}
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT SECTION */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>
                  Provide details about the message
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-5">
                {/* NAME */}
                <div>
                  <Label>Name</Label>
                  <Input
                    value={values.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="Enter full name"
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && (
                    <p className="text-xs text-red-500">{errors.name}</p>
                  )}
                </div>

                {/* EMAIL */}
                <div>
                  <Label>Email</Label>
                  <Input
                    value={values.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="example@email.com"
                    className={errors.email ? "border-red-500" : ""}
                  />
                  {errors.email && (
                    <p className="text-xs text-red-500">{errors.email}</p>
                  )}
                </div>

                {/* PHONE */}
                <div>
                  <Label>Phone</Label>
                  <Input
                    value={values.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    placeholder="Optional"
                  />
                </div>

                {/* SUBJECT */}
                <div>
                  <Label>Subject</Label>
                  <Input
                    value={values.subject}
                    onChange={(e) => handleChange("subject", e.target.value)}
                    placeholder="Optional"
                  />
                </div>

                {/* MESSAGE */}
                <div>
                  <Label>Message</Label>
                  <RichTextEditor
                    value={values.message}
                    onChange={(val) => handleChange("message", val)}
                    error={errors.message}
                  />
                  {errors.message && (
                    <p className="text-xs text-red-500">{errors.message}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT SECTION */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
                <CardDescription>
                  Admin can mark message as answered
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center border rounded-md p-3">
                  <Label>Mark as Answered</Label>
                  <Switch
                    checked={values.status === "answered"}
                    onCheckedChange={(v) =>
                      handleChange("status", v ? "answered" : "pending")
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FOOTER BUTTONS */}
        <div className="flex items-center gap-3 pt-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
              </>
            ) : isEdit ? (
              "Save Changes"
            ) : (
              "Submit Message"
            )}
          </Button>

          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={() => navigate("/admin/contact")}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
