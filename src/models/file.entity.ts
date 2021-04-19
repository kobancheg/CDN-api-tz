import { Schema, SchemaTypes, Document } from 'mongoose'

export const FileModel = new Schema({
   buffer: SchemaTypes.Buffer,
   idName: SchemaTypes.String,
   keyCrypt: SchemaTypes.String
})

export interface File extends Document {
   buffer: Buffer,
   idName: string,
   keyCrypt: string
}
