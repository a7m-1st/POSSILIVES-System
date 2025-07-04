package com.possilives.main.Audit;

import java.time.LocalDateTime;
import java.util.Optional;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.stereotype.Component;

import com.possilives.main.Model.AuditLog;
import com.possilives.main.Model.Users;
import com.possilives.main.Model.enums.ACTION_TYPES;
import com.possilives.main.Model.enums.TARGET_TYPES;
import com.possilives.main.Repository.AuditLogRepository;
import com.possilives.main.Service.UserService;

import lombok.RequiredArgsConstructor;

@Aspect
@Component
@RequiredArgsConstructor
public class AuditLogAspect {

    private final AuditLogRepository auditLogRepository;
    private final UserService userService; // service to get currently logged-in user

    @Pointcut("execution(* com.possilives.main.Service.*.*(..))")
    public void serviceMethods() {}

    // @Around("serviceMethods()")
    @Around("@annotation(com.possilives.main.Audit.Auditable)")
    public Object logAudit(ProceedingJoinPoint joinPoint) throws Throwable {        // Capture method info
        String signature = joinPoint.getSignature().toShortString();
        
        // Get method name
        String methodName = joinPoint.getSignature().getName().toLowerCase();
        ACTION_TYPES action = getActionType(methodName);
        TARGET_TYPES target = getTargetType(joinPoint.getTarget().getClass().getSimpleName(), methodName);

        // Initialize values
        String id = null;
        Integer habit_impact = null;

        // Only extract ID and impact for updateHabitImpact
        if ("updatehabitimpact".equals(methodName)) {
            Object[] args = joinPoint.getArgs();

            if (args != null && args.length > 0 && args[0] instanceof String) {
                id = (String) args[0];
            }

            if (args.length > 1 && args[1] instanceof Integer) {
                habit_impact = (Integer) args[1];
            }

            System.out.println("Habit impact for UserHabit " + id);
        }

        // Proceed with method execution
        Object result = joinPoint.proceed();

        // Save audit log
        AuditLog log = new AuditLog();
        log.setAction(action);
        log.setTarget(target);
        log.setSignature(signature);
        log.setCreatedAt(LocalDateTime.now());        

        if ("updatehabitimpact".equals(methodName)) {
            log.setHabit_impact(habit_impact);
            System.out.println("Setting habit_impact to: " + habit_impact);
            System.out.println("AuditLog habit_impact after setting: " + log.getHabit_impact());
        }

        Optional<Users> user = userService.getCurrentUser();
        if (user.isPresent()) {
            log.setAuditBy(user.get());
            System.out.println("Audit Log: " + log);
            auditLogRepository.save(log);
        }

        return result;
    }


    private ACTION_TYPES getActionType(String methodName) {
        if (methodName.startsWith("create") || methodName.contains("send") || methodName.startsWith("save")) return ACTION_TYPES.C;
        if (methodName.startsWith("get") || methodName.startsWith("find")) return ACTION_TYPES.R;
        if (methodName.startsWith("update")) return ACTION_TYPES.U;
        if (methodName.startsWith("delete") || methodName.startsWith("remove")) return ACTION_TYPES.D;
        return null;
    }    private TARGET_TYPES getTargetType(String className, String methodName) {
        // Special case for updateHabitImpact - this should be INFLUENCE target
        if ("updatehabitimpact".equals(methodName)) {
            return TARGET_TYPES.INFLUENCE;
        }
        
        if (className.toLowerCase().contains("habit")) return TARGET_TYPES.USERHABIT;
        if (className.toLowerCase().contains("generat")) return TARGET_TYPES.GENERATION;
        if (className.toLowerCase().contains("influence")) return TARGET_TYPES.INFLUENCE;
        if (className.toLowerCase().contains("notif")) return TARGET_TYPES.NOTIFICATION;
        return null;
    }
}
