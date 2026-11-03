export interface Player {
    Team: string,
    Player: string,
    Callsign?: string,
    Location: {
        LocationX: number,
        LocationZ: number,
        PostalCode: string,
        StreetName: string,
        BuildingNumber: string
    },
    Permissions: string,
    WantedStars: number
}
