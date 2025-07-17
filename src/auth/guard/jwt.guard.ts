// import { CanActivate, ExecutionContext, UnauthorizedException } from "@nestjs/common";
// import { Reflector } from "@nestjs/core";
// import { AuthGuard } from "@nestjs/passport";
// import { Observable } from "rxjs";
// import { IS_PUBLIC_KEY } from "../decorator/public.decorator";
// import { Injectable } from '@nestjs/common';

// @Injectable()
// export class JwtGuard extends AuthGuard('jwt') implements CanActivate{
//     constructor(private reflector:Reflector){
//         super();
//     }
//     canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
//         const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
//             context.getHandler(),
//             context.getClass(),
//         ]);
//         if (isPublic) {
//             return true;
//         }
//         return super.canActivate(context);
//     }
//       // ✅ This is the missing piece!
//   handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
//     if (err || !user) {
//       throw err || new UnauthorizedException('Unauthorized');
//     }
//     return user; // attaches the returned user to request.user
//   }
// }

import { CanActivate, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthGuard } from "@nestjs/passport";
import { Observable } from "rxjs";
import { IS_PUBLIC_KEY } from "../decorator/public.decorator";
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtGuard extends AuthGuard('jwt') implements CanActivate {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    console.log('🔒 ===== JWT GUARD CAN ACTIVATE =====');
    
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (isPublic) {
      console.log('🌍 Route is public, skipping auth');
      return true;
    }
    
    console.log('🔐 Route requires authentication');
    
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    console.log('🔍 Authorization header:', authHeader ? `Present: ${authHeader.substring(0, 20)}...` : 'MISSING');
    
    const result = super.canActivate(context);
    console.log('🔍 Super.canActivate result:', result);
    
    return result;
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    console.log('🔄 ===== JWT GUARD HANDLE REQUEST =====');
    console.log('❌ Error:', err);
    console.log('👤 User:', user);
    console.log('ℹ️ Info:', info);
    
    if (err) {
      console.log('❌ Error in handleRequest:', err.message);
      throw err;
    }
    
    if (!user) {
      console.log('❌ No user found in handleRequest');
      throw new UnauthorizedException('User not found');
    }
    
    console.log('✅ User successfully authenticated:', user.id);
    console.log('🔄 ===== JWT GUARD HANDLE REQUEST COMPLETED =====');
    
    return user;
  }
}
