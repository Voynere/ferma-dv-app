export const deliveryDataObj = {
    express: 399,
    zones: [
        // Склад "Заря" (зона "Чкалова") закрыт — снят из активной выдачи.
        // Раньше это была первая зона в массиве, поэтому именно она подставлялась
        // как склад по умолчанию, когда геолокация адреса не попадала ни в один полигон
        // (see getDefaultStoreQueue -> buildStoreQueue(null) fallback), из-за чего
        // при доставке на "любой" адрес остатки показывались нулевыми.
        // {
        //     zone: {
        //         id: 0,
        //         name: "Чкалова"
        //     },
        //     store: {
        //         id: "028e05a7-b4fa-11ee-0a80-1198000442be",
        //         name: "Заря"
        //     },
        //     express: 399,
        //     slots: [
        //         {
        //             time: "10:00 - 12:00",
        //             name: "Утро",
        //             order: [
        //                 {
        //                     from: 0,
        //                     to: 1499,
        //                     price: 399
        //                 },
        //                 {
        //                     from: 1500,
        //                     to: 2999,
        //                     price: 349
        //                 },
        //                 {
        //                     from: 3000,
        //                     to: 1000000,
        //                     price: 0
        //                 }
        //             ]
        //         },
        //         {
        //             time: "15:00 - 17:00",
        //             name: "День",
        //             order: [
        //                 {
        //                     from: 0,
        //                     to: 1499,
        //                     price: 399
        //                 },
        //                 {
        //                     from: 1500,
        //                     to: 2999,
        //                     price: 349
        //                 },
        //                 {
        //                     from: 3000,
        //                     to: 1000000,
        //                     price: 0
        //                 }
        //             ]
        //         },
        //         {
        //             time: "18:00 - 22:00",
        //             name: "Вечер",
        //             order: [
        //                 {
        //                     from: 0,
        //                     to: 999,
        //                     price: 349
        //                 },
        //                 {
        //                     from: 1000,
        //                     to: 1000000,
        //                     price: 0
        //                 }
        //             ]
        //         }
        //     ]
        // },

        {
            zone: {
                id: 1,
                name: "Космос"
            },
            store: {
                id: "a99d6fdf-0970-11ed-0a80-0ed600075845",
                name: "Космос"
            },
            express: 399,
            slots: [
                {
                    time: "10:00 - 12:00",
                    name: "Утро",
                    order: [
                        {
                            from: 0,
                            to: 1499,
                            price: 399
                        },
                        {
                            from: 1500,
                            to: 2999,
                            price: 349
                        },
                        {
                            from: 3000,
                            to: 1000000,
                            price: 0
                        }
                    ]
                },
                {
                    time: "15:00 - 17:00",
                    name: "День",
                    order: [
                        {
                            from: 0,
                            to: 1499,
                            price: 399
                        },
                        {
                            from: 1500,
                            to: 2999,
                            price: 349
                        },
                        {
                            from: 3000,
                            to: 1000000,
                            price: 0
                        }
                    ]
                },
                {
                    time: "18:00 - 22:00",
                    name: "Вечер",
                    order: [
                        {
                            from: 0,
                            to: 999,
                            price: 349
                        },
                        {
                            from: 1000,
                            to: 1000000,
                            price: 0
                        }
                    ]
                }
            ]
        },

        {
            zone: {
                id: 2,
                name: "Эгершельд"
            },
            store: {
                id: "7c0dc9ce-ce1e-11ea-0a80-09ca000e5e93",
                name: "Эгершельд"
            },
            express: 399,
            slots: [
                {
                    time: "10:00 - 12:00",
                    name: "Утро",
                    order: [
                        {
                            from: 0,
                            to: 1499,
                            price: 399
                        },
                        {
                            from: 1500,
                            to: 2999,
                            price: 349
                        },
                        {
                            from: 3000,
                            to: 1000000,
                            price: 0
                        }
                    ]
                },
                {
                    time: "15:00 - 17:00",
                    name: "День",
                    order: [
                        {
                            from: 0,
                            to: 1499,
                            price: 399
                        },
                        {
                            from: 1500,
                            to: 2999,
                            price: 349
                        },
                        {
                            from: 3000,
                            to: 1000000,
                            price: 0
                        }
                    ]
                },
                {
                    time: "18:00 - 22:00",
                    name: "Вечер",
                    order: [
                        {
                            from: 0,
                            to: 999,
                            price: 349
                        },
                        {
                            from: 1000,
                            to: 1000000,
                            price: 0
                        }
                    ]
                }
            ]
        },

        {
            zone: {
                id: 3,
                name: "РусскийБлижний"
            },
            store: {
                id: "7c0dc9ce-ce1e-11ea-0a80-09ca000e5e93",
                name: "Эгершельд"
            },
            express: 800,
            slots: [
                {
                    from: 0,
                    to: 4999,
                    price: 800
                },
                {
                    from: 5000,
                    to: 7999,
                    price: 500
                },
                {
                    from: 8000,
                    to: 1000000,
                    price: 0
                }
            ]
        },

        {
            zone: {
                id: 13,
                name: "РусскийСредний"
            },
            store: {
                id: "7c0dc9ce-ce1e-11ea-0a80-09ca000e5e93",
                name: "Эгершельд"
            },
            express: 800,
            slots: [
                {
                    from: 0,
                    to: 4999,
                    price: 800
                },
                {
                    from: 5000,
                    to: 7999,
                    price: 500
                },
                {
                    from: 8000,
                    to: 1000000,
                    price: 0
                }
            ]
        },

        {
            zone: {
                id: 14,
                name: "РусскийДальний"
            },
            store: {
                id: "7c0dc9ce-ce1e-11ea-0a80-09ca000e5e93",
                name: "Эгершельд"
            },
            express: 800,
            slots: [
                {
                    from: 0,
                    to: 4999,
                    price: 800
                },
                {
                    from: 5000,
                    to: 7999,
                    price: 500
                },
                {
                    from: 8000,
                    to: 1000000,
                    price: 0
                }
            ]
        },

        {
            zone: {
                id: 4,
                name: "Щитовая"
            },
            store: {
                id: "a99d6fdf-0970-11ed-0a80-0ed600075845",
                name: "Космос"
            },
            express: 500,
            slots: [
                {
                    from: 0,
                    to: 7999,
                    price: 500
                },
                {
                    from: 8000,
                    to: 1000000,
                    price: 0
                }
            ]
        },

        {
            zone: {
                id: 5,
                name: "Шамора"
            },
            store: {
                id: "a99d6fdf-0970-11ed-0a80-0ed600075845",
                name: "Космос"
            },
            express: 500,
            slots: [
                {
                    from: 0,
                    to: 7999,
                    price: 500
                },
                {
                    from: 8000,
                    to: 1000000,
                    price: 0
                }
            ]
        },

        {
            zone: {
                id: 6,
                name: "ДеФризБлижний"
            },
            store: {
                id: "a99d6fdf-0970-11ed-0a80-0ed600075845",
                name: "Космос"
            },
            express: 700,
            slots: [
                {
                    from: 0,
                    to: 6999,
                    price: 700
                },
                {
                    from: 7000,
                    to: 1000000,
                    price: 0
                }
            ]
        },

        {
            zone: {
                id: 15,
                name: "ДеФризДальний"
            },
            store: {
                id: "a99d6fdf-0970-11ed-0a80-0ed600075845",
                name: "Космос"
            },
            express: 700,
            slots: [
                {
                    from: 0,
                    to: 6999,
                    price: 700
                },
                {
                    from: 7000,
                    to: 1000000,
                    price: 0
                }
            ]
        },

        {
            zone: {
                id: 16,
                name: "Трудовое"
            },
            store: {
                id: "a99d6fdf-0970-11ed-0a80-0ed600075845",
                name: "Космос"
            },
            express: 700,
            slots: [
                {
                    from: 0,
                    to: 7999,
                    price: 700
                },
                {
                    from: 8000,
                    to: 1000000,
                    price: 0
                }
            ]
        },

        {
            zone: {
                id: 7,
                name: "Артём"
            },
            store: {
                id: "a99d6fdf-0970-11ed-0a80-0ed600075845",
                name: "Космос"
            },
            express: 700,
            slots: [
                {
                    from: 0,
                    to: 7999,
                    price: 700
                },
                {
                    from: 8000,
                    to: 1000000,
                    price: 0
                }
            ]
        }
    ]
}
