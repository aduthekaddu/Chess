import { Request, Response } from 'express';
import db from "@chess/db/client"
import { sign } from 'jsonwebtoken';
import { hash, compare } from 'bcrypt';
import { JWT_SECRET } from "@chess/backend-common/config";



export const signup = async (req:any, res:any)=> {
    try{
        console.log("signup")
        const {email, password } = req.body;

        // Check if user already exists
        const existingUser = await db.user.findUnique({
            where: {
                email
            }
        })

        if (existingUser) {
            return res.status(400).json({ message: "User already exists" })
        }

        // Hash the password
        const hashedPassword = await hash(password, 10);

        // Create new user
        const user = await db.user.create({
            data: {
                email,
                password: hashedPassword
            }
        })
        return res.status(201).json({ message: "User created successfully", user });

    }catch(err){
        console.log(err)
        return res.status(500).json({message: "Internal server error"})
    }
}


export const login = async (req: any, res: any) => {
    try{
        const { email, password } = req.body;

        // Check if user exists
        const user = await db.user.findUnique({
            where: {
                email
            }
        })

        if (!user) {
            return res.status(400).json({ message: "User does not exist" })
        }

        // Check password
        const isMatch = await compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" })
        }

        // Create token
        const token = sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });

        // Set cookie
        // res.cookie('chess_authentication_token', token, {
        //     secure: false, // ❌ Localhost pe false rakhna zaroori hai!
        //     maxAge: 7 * 24 * 60 * 60 * 1000
        // });

        res.cookie('chess_authentication_token', token, {
            secure: true,           
            sameSite: 'None',       
            httpOnly: true,         
            maxAge: 7 * 24 * 60 * 60 * 1000
          });
          

        return res.status(200).json({ message: "Login successful", token });

    }catch(err){
        console.log(err)
        return res.status(500).json({message: "Internal server error"})
    }
}