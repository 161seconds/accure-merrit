import swaggerJsdoc from 'swagger-jsdoc'
import { Express } from 'express'
import swaggerUi from 'swagger-ui-express'

const swaggerDefinition: swaggerJsdoc.OAS3Definition = {
    openapi: '3.0.0',
    info: {
        title: 'AccrueMerit API',
        version: '1.0.0',
        description: 'Karma Management System – Hệ thống quản lý công đức',
        contact: {
            name: '161seconds',
            url: 'https://github.com/161seconds/accrue-merit'
        },
        license: {
            name: 'MIT',
            url: 'https://opensource.org/licenses/MIT'
        }
    },
    servers: [
        {
            url: '/api',
            description: 'API Server'
        }
    ],
    components: {
        securitySchemes: {
            BearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                description: 'Nhập access_token nhận được từ /login'
            }
        },
        schemas: {
            // ── Auth ──
            RegisterBody: {
                type: 'object',
                required: ['username', 'email', 'password', 'confirm_password', 'name'],
                properties: {
                    username: { type: 'string', example: 'user123', minLength: 3, maxLength: 30 },
                    email: { type: 'string', format: 'email', example: 'user@example.com' },
                    password: { type: 'string', example: 'Abc@1234', minLength: 6 },
                    confirm_password: { type: 'string', example: 'Abc@1234' },
                    name: { type: 'string', example: 'Nguyễn Văn A' }
                }
            },
            LoginBody: {
                type: 'object',
                required: ['username', 'password'],
                properties: {
                    username: { type: 'string', example: '161seconds' },
                    password: { type: 'string', example: 'Abc@1234' }
                }
            },
            TokenPair: {
                type: 'object',
                properties: {
                    access_token: { type: 'string' },
                    refresh_token: { type: 'string' }
                }
            },

            // ── User ──
            UserProfile: {
                type: 'object',
                properties: {
                    _id: { type: 'string' },
                    username: { type: 'string' },
                    email: { type: 'string' },
                    name: { type: 'string' },
                    avatar: { type: 'string' },
                    stats: { $ref: '#/components/schemas/UserStats' },
                    settings: { $ref: '#/components/schemas/UserSettings' },
                    created_at: { type: 'string', format: 'date-time' }
                }
            },
            UserStats: {
                type: 'object',
                properties: {
                    ducTotal: { type: 'number', description: 'Tổng điểm đức' },
                    toiTotal: { type: 'number', description: 'Tổng điểm tội' },
                    moCount: { type: 'number', description: 'Số lần gõ mõ' },
                    streak: { type: 'number', description: 'Chuỗi ngày liên tiếp' },
                    lastActiveDate: { type: 'string', format: 'date-time', nullable: true }
                }
            },
            UserSettings: {
                type: 'object',
                properties: {
                    font: { type: 'string', example: 'Noto Serif' },
                    theme: { type: 'string', example: 'dark' },
                    language: { type: 'string', example: 'vi' }
                }
            },

            // ── Karma ──
            CreateKarmaLog: {
                type: 'object',
                required: ['type', 'title', 'points'],
                properties: {
                    type: { type: 'string', enum: ['duc', 'toi'], description: 'duc = đức, toi = tội' },
                    title: { type: 'string', example: 'Giúp đỡ người già qua đường' },
                    description: { type: 'string', example: 'Tại ngã tư Nguyễn Huệ' },
                    points: { type: 'number', minimum: 1, maximum: 100, example: 10 },
                    category: { type: 'string', example: 'Từ thiện' }
                }
            },
            KarmaLog: {
                type: 'object',
                properties: {
                    _id: { type: 'string' },
                    user_id: { type: 'string' },
                    type: { type: 'string', enum: ['duc', 'toi'] },
                    title: { type: 'string' },
                    description: { type: 'string' },
                    points: { type: 'number' },
                    category: { type: 'string' },
                    created_at: { type: 'string', format: 'date-time' }
                }
            },

            // ── Wish ──
            CreateWish: {
                type: 'object',
                required: ['category', 'content'],
                properties: {
                    category: {
                        type: 'string',
                        enum: ['suc-khoe', 'gia-dao', 'hoc-tap', 'su-nghiep', 'tinh-duyen', 'binh-an', 'khac']
                    },
                    content: { type: 'string', example: 'Cầu gia đình bình an, mạnh khoẻ' },
                    incense_type: { type: 'string', enum: ['tram-huong', 'que', 'nhai', 'bach-dan'], default: 'tram-huong' }
                }
            },

            // ── Wooden Fish ──
            WoodenFishTap: {
                type: 'object',
                properties: {
                    count: { type: 'integer', default: 1, description: 'Số lần gõ' }
                }
            },

            // ── Common ──
            ErrorResponse: {
                type: 'object',
                properties: {
                    message: { type: 'string' },
                    errors: { type: 'object' }
                }
            },
            Pagination: {
                type: 'object',
                properties: {
                    page: { type: 'integer' },
                    limit: { type: 'integer' },
                    total: { type: 'integer' },
                    totalPages: { type: 'integer' }
                }
            }
        }
    },
    tags: [
        { name: 'Auth', description: 'Đăng ký, đăng nhập, refresh token' },
        { name: 'User', description: 'Profile, cài đặt, thống kê' },
        { name: 'Karma', description: 'Sổ tay đức/tội' },
        { name: 'Wishes', description: 'Thắp nhang - lời nguyện' },
        { name: 'WoodenFish', description: 'Gõ mõ tích đức' }
    ],
    paths: {
        // ══════ AUTH ══════
        '/register': {
            post: {
                tags: ['Auth'],
                summary: 'Đăng ký tài khoản',
                requestBody: {
                    required: true,
                    content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterBody' } } }
                },
                responses: {
                    '201': { description: 'Đăng ký thành công' },
                    '409': { description: 'Username hoặc email đã tồn tại' },
                    '422': { description: 'Dữ liệu không hợp lệ' }
                }
            }
        },
        '/login': {
            post: {
                tags: ['Auth'],
                summary: 'Đăng nhập',
                requestBody: {
                    required: true,
                    content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginBody' } } }
                },
                responses: {
                    '200': { description: 'Trả về user + access_token + refresh_token' },
                    '422': { description: 'Sai tài khoản hoặc mật khẩu' }
                }
            }
        },
        '/logout': {
            post: {
                tags: ['Auth'],
                summary: 'Đăng xuất',
                security: [{ BearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['refresh_token'],
                                properties: { refresh_token: { type: 'string' } }
                            }
                        }
                    }
                },
                responses: { '200': { description: 'Đăng xuất thành công' } }
            }
        },
        '/refresh-token': {
            post: {
                tags: ['Auth'],
                summary: 'Refresh access token',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['refresh_token'],
                                properties: { refresh_token: { type: 'string' } }
                            }
                        }
                    }
                },
                responses: { '200': { description: 'Trả về cặp token mới' } }
            }
        },

        // ══════ USER ══════
        '/me': {
            get: {
                tags: ['User'],
                summary: 'Lấy profile',
                security: [{ BearerAuth: [] }],
                responses: { '200': { description: 'Thông tin user' } }
            },
            patch: {
                tags: ['User'],
                summary: 'Cập nhật profile',
                security: [{ BearerAuth: [] }],
                requestBody: {
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    name: { type: 'string' },
                                    avatar: { type: 'string' },
                                    date_of_birth: { type: 'string', format: 'date' }
                                }
                            }
                        }
                    }
                },
                responses: { '200': { description: 'Cập nhật thành công' } }
            }
        },
        '/change-password': {
            put: {
                tags: ['User'],
                summary: 'Đổi mật khẩu',
                security: [{ BearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['old_password', 'password', 'confirm_password'],
                                properties: {
                                    old_password: { type: 'string' },
                                    password: { type: 'string' },
                                    confirm_password: { type: 'string' }
                                }
                            }
                        }
                    }
                },
                responses: { '200': { description: 'Đổi mật khẩu thành công' } }
            }
        },
        '/settings': {
            put: {
                tags: ['User'],
                summary: 'Cập nhật cài đặt',
                security: [{ BearerAuth: [] }],
                requestBody: {
                    content: {
                        'application/json': { schema: { $ref: '#/components/schemas/UserSettings' } }
                    }
                },
                responses: { '200': { description: 'Cập nhật thành công' } }
            }
        },
        '/stats': {
            get: {
                tags: ['User'],
                summary: 'Lấy thống kê (ducTotal, toiTotal, moCount, streak)',
                security: [{ BearerAuth: [] }],
                responses: { '200': { description: 'Thống kê user' } }
            }
        },
        '/account': {
            delete: {
                tags: ['User'],
                summary: 'Xoá tài khoản (cần mật khẩu)',
                security: [{ BearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['password'],
                                properties: { password: { type: 'string' } }
                            }
                        }
                    }
                },
                responses: { '200': { description: 'Xoá thành công' } }
            }
        },

        // ══════ KARMA ══════
        '/karma': {
            post: {
                tags: ['Karma'],
                summary: 'Thêm bản ghi đức/tội',
                security: [{ BearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateKarmaLog' } } }
                },
                responses: { '201': { description: 'Tạo thành công' } }
            },
            get: {
                tags: ['Karma'],
                summary: 'Danh sách bản ghi',
                security: [{ BearerAuth: [] }],
                parameters: [
                    { in: 'query', name: 'type', schema: { type: 'string', enum: ['duc', 'toi'] } },
                    { in: 'query', name: 'category', schema: { type: 'string' } },
                    { in: 'query', name: 'page', schema: { type: 'integer', default: 1 } },
                    { in: 'query', name: 'limit', schema: { type: 'integer', default: 20 } },
                    { in: 'query', name: 'startDate', schema: { type: 'string', format: 'date' } },
                    { in: 'query', name: 'endDate', schema: { type: 'string', format: 'date' } }
                ],
                responses: { '200': { description: 'Danh sách bản ghi + pagination' } }
            }
        },
        '/karma/summary': {
            get: {
                tags: ['Karma'],
                summary: 'Tổng hợp đức/tội theo category',
                security: [{ BearerAuth: [] }],
                responses: { '200': { description: 'ducByCategory, toiByCategory, recentLogs' } }
            }
        },
        '/karma/{id}': {
            get: {
                tags: ['Karma'],
                summary: 'Chi tiết 1 bản ghi',
                security: [{ BearerAuth: [] }],
                parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
                responses: { '200': { description: 'Chi tiết bản ghi' } }
            },
            put: {
                tags: ['Karma'],
                summary: 'Sửa bản ghi',
                security: [{ BearerAuth: [] }],
                parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
                requestBody: {
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    title: { type: 'string' },
                                    description: { type: 'string' },
                                    points: { type: 'number' },
                                    category: { type: 'string' }
                                }
                            }
                        }
                    }
                },
                responses: { '200': { description: 'Cập nhật thành công' } }
            },
            delete: {
                tags: ['Karma'],
                summary: 'Xoá bản ghi',
                security: [{ BearerAuth: [] }],
                parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
                responses: { '200': { description: 'Xoá thành công' } }
            }
        },

        // ══════ WISHES ══════
        '/wishes': {
            post: {
                tags: ['Wishes'],
                summary: 'Thắp nhang - gửi lời nguyện',
                security: [{ BearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateWish' } } }
                },
                responses: { '201': { description: 'Gửi lời nguyện thành công' } }
            },
            get: {
                tags: ['Wishes'],
                summary: 'Danh sách lời nguyện',
                security: [{ BearerAuth: [] }],
                parameters: [
                    { in: 'query', name: 'page', schema: { type: 'integer' } },
                    { in: 'query', name: 'limit', schema: { type: 'integer' } },
                    { in: 'query', name: 'category', schema: { type: 'string' } }
                ],
                responses: { '200': { description: 'Danh sách + pagination' } }
            }
        },
        '/wishes/{id}': {
            delete: {
                tags: ['Wishes'],
                summary: 'Xoá lời nguyện',
                security: [{ BearerAuth: [] }],
                parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
                responses: { '200': { description: 'Xoá thành công' } }
            }
        },

        // ══════ WOODEN FISH ══════
        '/wooden-fish/tap': {
            post: {
                tags: ['WoodenFish'],
                summary: 'Gõ mõ (tăng moCount + ducTotal)',
                security: [{ BearerAuth: [] }],
                requestBody: {
                    content: { 'application/json': { schema: { $ref: '#/components/schemas/WoodenFishTap' } } }
                },
                responses: { '200': { description: 'moCount, ducTotal, added' } }
            }
        },
        '/wooden-fish/count': {
            get: {
                tags: ['WoodenFish'],
                summary: 'Tổng số lần gõ mõ',
                security: [{ BearerAuth: [] }],
                responses: { '200': { description: 'moCount' } }
            }
        }
    }
}

const swaggerSpec = swaggerJsdoc({ definition: swaggerDefinition, apis: [] })

export const setupSwagger = (app: Express) => {
    app.use(
        '/api-docs',
        swaggerUi.serve,
        swaggerUi.setup(swaggerSpec, {
            customCss: '.swagger-ui .topbar { display: none }',
            customSiteTitle: 'AccrueMerit API Docs',
            customfavIcon: ''
        })
    )
    console.log('📖 Swagger UI: http://localhost:' + (process.env.PORT || 3000) + '/api-docs')
}

export { swaggerSpec }