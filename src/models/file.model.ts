import { Schema, SchemaTypes, Document } from 'mongoose'

export const FileModel = new Schema({
   iv: SchemaTypes.Buffer,
   name: SchemaTypes.String,
   type: SchemaTypes.String,
   idName: SchemaTypes.String,
   keyCrypt: SchemaTypes.Buffer
}, {
   timestamps: true
})

FileModel.index({ idName: 1 }, { name: 'idNameSearchIndex' })
export interface File extends Document {
   iv: Buffer,
   name: string,
   type: string,
   idName: string,
   keyCrypt: Buffer
}
