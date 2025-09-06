export const signupReq = (
    email = "test@test.com",
    password = "password123"
) => {
    return new Request('http://localhost:3000/api/v1/auth/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email,
            password,
        }),
    });
}

export const loginReq = (
    email = "test@test.com",
    password = "password123"
) => {
    return new Request('http://localhost:3000/api/v1/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email,
            password,
        }),
    });
}

export const logoutReq = () => {
    return new Request('http://localhost:3000/api/v1/auth/logout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    });
}


