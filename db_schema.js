export const users = [
    {
        name:'userName',
        type: 'varchar(255)'
    },
    {
        name:'userAddress',
        type: 'varchar(255)'
    },
    {
        name:'userEmail',
        type: 'varchar(255)'
    },
    {
        name:'user_image',
        type: 'varchar(255)'
    },
    {
        name:'usercountry',
        type: 'varchar(255)'
    },
    {
        name: 'usercity',
        type: 'varchar(255) unique'
    },
    {
        name:'userPassword',
        type: 'varchar(255)'
    },
    {
        name:'date_of_birth',
        type: 'DATE'
    }
]

export const Boats=[
    {
        name:'boatName',
        type:'varchar(255)'
    },

    {
        name:'boatType',
        type:'varchar(255)'
    },
    {
        name:'boatDescription',
        type:'varchar(255)'
    },
    {
        name:'rental_price_per_hour',
        type:'decimal(10,2)'
    },

    {
        name:'isavailable',
        type:'boolean'
    }
]

export const Rental=[
    {
      name:'rental_last_name',
      type:'varchar(30)'  
    },
    {
        name:'rental_first_name',
        type:'varchar(50)'

    },
    {
        name:'rental_email_address',
        type:'varchar(80)'
    },
    {
        name:'rental_phone',
        type:'varchar(50)'
    },
    {
        name:'start_address',
        type:'varchar(50)'
    },
    {
        name:'end_address',
        type:'varchar(50)'
    },
    {
        name:'baggages_number',
        type:'varchar(50)'
    },
    {
        name:'person_number',
        type:'varchar(50)'
    },
    {
        name:'rental_date',
        type:'Date'
    },
    {
        name:'rental_time',
        type:'Time'
    },
    {
        name:'description',
        type:'varchar(255)'
    },
    {
        name:'rental_payment',
        type:'varchar(255)'
    }
]

export const MODELS = [
    {
      name:"users",
      table:users
    },
    {
        name:"boats",
        table:Boats
    },
    {
        name:"rental",
        table:Rental
    }
]