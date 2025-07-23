import z from 'zod'

const seriesEnum = z.enum(['bandori', 'chika_idol'])
const eventSchema = z.object({
	name: z.string(),
	series: seriesEnum,
    location: z.string(),
	eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
})

type EventItem = z.infer<typeof eventSchema>

export async function getEvents(numberOfEvents: number, series: string, env: Env): Promise<EventItem[]> {
    if (!seriesEnum.safeParse(series).success) {
        console.warn(`Invalid event series: ${series}`);
        return []
    }
	const response = await env.D1_DB.prepare(
		'SELECT name, series, event_date, location FROM events WHERE series = ? ORDER BY event_date DESC LIMIT ?'
	)
		.bind(series, numberOfEvents)
		.all<{ name: string; series: string; event_date: string, location: string }>()

	const rs: EventItem[] = []

	for (const row of response.results) {
		const mappedRow = {
			name: row.name,
			series: row.series,
			eventDate: row.event_date,
            location: row.location
		}
		const parsedRow = eventSchema.safeParse(mappedRow)
		if (parsedRow.success) {
			rs.push(parsedRow.data)
		}
	}
	return rs
}

// TODO: Use KV to cache events
