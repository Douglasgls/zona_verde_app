import { Icons } from "@/components/icons"

interface NavItem {
    title: string
    to?: string
    href?: string
    disabled?: boolean
    external?: boolean
    icon?: keyof typeof Icons
    label?: string
}

interface NavItemWithChildren extends NavItem {
    items?: NavItemWithChildren[]
}

export const mainMenu: NavItemWithChildren[] = [
    {
        title: 'Visão Geral',
        to: '/',
    },
    {
        title: 'Clientes',
        to: '/clients',
    },
    {
        title: 'Vagas',
        to: '/spots',
    },
    {
        title: 'Dispositivos',
        to: '/devices',
    },
    {
        title: 'Reservas',
        to: '/reservations',
    }
]

// export const sideMenu: NavItemWithChildren[] = [
    
//     {
//         title: 'Overview',
//         to: '/',
//     },
//     {
//         title: 'Layouts',
//         items: [
//             {
//                 title: 'Topnav Layout',
//                 to: '/layout/topnav',
//             },
//             {
//                 title: 'Sidenav Layout',
//                 to: '/layout/sidenav',
//             },
//         ],
//     },
//     {
//         title: 'Elements UI',
//     },
//     {
//         title: 'Forms',
//         to: '/forms',
//     },
//     {
//         title: 'Tables',
//         to: '/table',
//     },
//     {
//         title: 'Widgets',
//         to: '/widgets',
//     },
//     {
//         title: 'Components',
//         to: '/components',
//     },
//     {
//         title: 'Extra UI',
//     },
//     {
//         title: 'Auth Pages',
//         items: [
//             {
//                 title: 'Login',
//                 to: '/auth/login',
//             },
//             {
//                 title: 'Register',
//                 to: '/auth/register',
//             },
//         ],
//     },
//     {
//         title: 'Empty Page',
//         to: '/empty',
//     },
//     {
//         title: 'Error Page',
//         to: '/error',
//     },
// ]
