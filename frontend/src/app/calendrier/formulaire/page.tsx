"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

type User = {
  id: number
  username: string
  email: string
  firstName: string
  lastName: string
  Role: { id: number; role: string }
  Grade?: { id: number; name: string }
}

// --- Génération des créneaux horaires ---
const timeSlots: string[] = [];
for (let hour = 8; hour <= 19; hour++) {
  const formattedHour = hour.toString().padStart(2, "0");
  timeSlots.push(`${formattedHour}:00`);
  if (hour !== 19) timeSlots.push(`${formattedHour}:30`);
}

// --- Schéma de validation Zod ---
const formSchema = z.object({
  date: z.string().min(1, "La date est requise"),
  startTime: z.string().min(1, "L'heure de début est requise"),
  endTime: z.string().min(1, "L'heure de fin est requise"),
  roomId: z.string().min(1, "La salle est requise"),
  subjectId: z.string().min(1, "La matière est requise"),
  teacherId: z.string().min(1, "L'enseignant est requis"),
  gradeId: z.string().min(1, "La classe est requise"),
});

export default function CreateCoursePage() {
  // --- États ---
  const [teachers, setTeachers] = useState<User[]>([]);
  const [isFetchingTeachers, setIsFetchingTeachers] = useState(true);

  // États basiques pour éviter les erreurs de compilation sur tes variables existantes
  const [rooms, setRooms] = useState<{ id: number; name: string; capacity: number }[]>([]);
  const [subjects, setSubjects] = useState<{ id: number; name: string }[]>([]);
  const [grades, setGrades] = useState<{ id: number; name: string }[]>([]);

  // --- Configuration du formulaire ---
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: "",
      startTime: "",
      endTime: "",
      roomId: "",
      subjectId: "",
      teacherId: "",
      gradeId: "",
    },
  });

  const selectedStartTime = form.watch("startTime");
  const isSubmitting = form.formState.isSubmitting;

  // --- Récupération des professeurs ---
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/users/roleId/4?limit=100`);

        console.log(response);
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des professeurs");
        }
        const json = await response.json();
        if (json.data) {
          setTeachers(json.data);
        }
      } catch (error) {
        console.error("Impossible de charger les professeurs:", error);
      } finally {
        setIsFetchingTeachers(false);
      }
    };

    fetchTeachers();
  }, []);

  // --- Soumission du formulaire ---
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log("Valeurs soumises :", values);
    // Ta logique d'envoi API ici
  };

  return (
    <div className="max-w-2xl mx-auto p-6 md:p-8 mt-8 bg-card rounded-2xl border border-border shadow-sm">
      <h1 className="text-2xl font-bold mb-6 text-foreground">Créer un cours</h1>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" autoComplete="off">
          
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date du cours</FormLabel>
                <FormControl>
                  <Input type="date" {...field} className="bg-background" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="startTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Heure de début</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || undefined}>
                    <FormControl>
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Choisir l'heure" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {timeSlots.map((slot) => (
                        <SelectItem key={`start-${slot}`} value={slot}>
                          {slot}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Heure de fin</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value || undefined}
                    disabled={!selectedStartTime} 
                  >
                    <FormControl>
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder={selectedStartTime ? "Choisir l'heure" : "Sélectionnez d'abord le début"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {timeSlots.map((slot) => {
                        const isPast = selectedStartTime ? slot <= selectedStartTime : false;
                        return (
                          <SelectItem key={`end-${slot}`} value={slot} disabled={isPast}>
                            {slot}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="roomId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Salle</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || undefined}>
                    <FormControl>
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Sélectionner une salle" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {rooms.map((room) => (
                        <SelectItem key={room.id} value={room.id.toString()}>
                          {room.name} (Cap.: {room.capacity})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="subjectId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Matière</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || undefined}>
                    <FormControl>
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Sélectionner une matière" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id.toString()}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="teacherId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Enseignant</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || undefined} disabled={isFetchingTeachers}>
                    <FormControl>
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder={isFetchingTeachers ? "Chargement..." : "Sélectionner un enseignant"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {teachers.map((teacher) => (
                        <SelectItem key={teacher.id} value={teacher.id.toString()}>
                          {teacher.firstName} {teacher.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="gradeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Classe / Niveau</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || undefined}>
                    <FormControl>
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Sélectionner une classe" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {grades.map((grade) => (
                        <SelectItem key={grade.id} value={grade.id.toString()}>
                          {grade.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full mt-4"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enregistrement...
              </>
            ) : (
              "Enregistrer le cours"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}