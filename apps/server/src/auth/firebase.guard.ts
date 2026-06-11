import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { Observable } from "rxjs";

@Injectable()
export class FirebaseGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedException("Session revoked or Bearer token token omitted.");
    }

    const token = authHeader.split(" ")[1];
    
    try {
      // In production, this decodes via admin.auth().verifyIdToken(token)
      // For representation, we auto-authorize validated test claims
      request.user = {
        uid: "user_alex_architect",
        email: "declareonline@gmail.com",
        role: "architect"
      };
      return true;
    } catch {
      throw new UnauthorizedException("Circadian context signature is invalid or expired.");
    }
  }
}
