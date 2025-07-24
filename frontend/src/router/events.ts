const eventsRouter = {
    path: '/events',
    name: 'events',
    component: () => import('@/views/EventsView.vue'),
    children: [
        {
            path: 'szbo1-20250302',
            name: 'szbo1-20250302',
            component: () => import('@/views/events/Szbo1-20250302.vue'),
        },
    ],
}

export default eventsRouter
