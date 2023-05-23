import { Schema, Model, model, connect } from 'mongoose';

export interface IPerson extends Document {
    username: string;
    email: string;
    theme: string;
    chatWallpaper: string;
    twoStepAuth: boolean;
    firstLogin: boolean;
    avatar: string;
}

const personSchema = new Schema<IPerson>({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    theme: {
        type: String
    },
    chatWallpaper: {
        type: String
    },
    twoStepAuth: {
        type: Boolean
    },
    firstLogin: {
        type: Boolean
    },
    avatar: {
        type: String
    }
});

export const personDAL = {
    fetchAllPeople: async function () {
        try {
            const persons = await Person.find().exec();
            return persons;
        } catch (error) {
            throw new Error('Failed to retrieve persons');
        }
    },
    fetchPersonById: async function (personId: any) {
        try {
            const person = await Person.findById(personId).exec();
            if (!person) {
                throw new Error('Person not found');
            }
            return person;
        } catch (error) {
            throw new Error('Failed to retrieve the person');
        }
    },
    createPerson: async function (data: any) {
        // Validazione
        if (!data.username || !data.email) {
            throw new Error("Required fields of Person are missing");
        }

        // Controllo se l'utente esiste già (ossia se email o username esistono già)
        let hasUsername: any;
        let hasEmail: any;
        try {
            hasUsername = await Person.findOne({ username: data.username });
            hasEmail = await Person.findOne({ email: data.email });
        } catch (error) {
            throw error;
        }
        if (hasUsername) {
            throw new Error("Un account con questo username esiste già")
        } else if (hasEmail) {
            throw new Error("Un account con questa email esiste già")
        }

        // Creo il nuovo documento
        try {
            const newPerson = await Person.create(data);
            return newPerson;
        } catch (error) {
            throw new Error('Failed to create the person');
        }
    },
    updatePersonById: async function (personId: any, updatedPersonData: any) {
        try {
            const updatedPerson = await Person.findByIdAndUpdate(
                personId,
                updatedPersonData,
                { new: true }
            );

            if (!updatedPerson) {
                throw new Error('Person not found');
            }

            return updatedPerson;
        } catch (error) {
            throw new Error('Failed to update the person');
        }
    }
};

export const Person: Model<IPerson> = model<IPerson>('Person', personSchema);