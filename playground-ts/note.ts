import { z } from "zod";

const NoteBody = z.object({
    text: z.string().trim().max(2000),
    minute: z.number().int().nullable().optional(),
    labels: z.array(z.string().trim().min(1).max(40)).max(8).optional(),
}).refine((n) => n.text.length > 0 || (n.labels?.length ?? 0) > 0, {
    message: "text or labels required",
});

type NoteBody = z.infer<typeof NoteBody>;

const rawBody1 = '{ "text": "Bon match !" }';
const rawBody2 = '{ "labels": ["Bon pressing"] }';
const rawBody3 = '{ "text": "" }';
const rawBody4 = '{ "labels": [\
        "Bon pressing",\
        "Bon match",\
        "Perte de balle",\
        "Buteur",\
        "Avant-dernière passe",\
        "Excellent",\
        "Décisif",\
        "Gros tacle",\
        "Sans faute"\
    ]\
}';

function parseJSON(rawBody: string) {
    const parsed = NoteBody.safeParse(JSON.parse(rawBody));
    if (!parsed.success) console.error({ status: 400, body: parsed.error.issues });
    console.log(parsed.data);
}

parseJSON(rawBody1);
parseJSON(rawBody2);
parseJSON(rawBody3);
parseJSON(rawBody4);