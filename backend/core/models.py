from django.db import models
from django.core.validators import MinValueValidator
from django.contrib.auth.hashers import make_password, check_password


from django.contrib.auth.hashers import make_password, check_password


class Usuario(models.Model):
    """Empleados/administradores que usan el sistema (tabla usuarios)."""

    CARGO_CHOICES = [
        ('empleado', 'Empleado'),
        ('administrador', 'Administrador'),
    ]
    ESTADO_CHOICES = [
        ('activo', 'Activo'),
        ('inactivo', 'Inactivo'),
    ]

    nombre = models.CharField(max_length=150)
    correo = models.EmailField(unique=True)
    password = models.CharField(max_length=128, default='')
    cargo = models.CharField(max_length=20, choices=CARGO_CHOICES, default='empleado')
    estado = models.CharField(max_length=10, choices=ESTADO_CHOICES, default='activo')
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'usuarios'
        ordering = ['-fecha_creacion']

    def __str__(self):
        return self.nombre

    def set_password(self, raw_password):
        self.password = make_password(raw_password)

    def check_password(self, raw_password):
        return check_password(raw_password, self.password)


class Categoria(models.Model):
    """Categorías de productos (tabla categorias)."""

    nombre = models.CharField(max_length=100, unique=True)
    descripcion = models.TextField(blank=True, null=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'categorias'
        ordering = ['nombre']

    def __str__(self):
        return self.nombre


class Producto(models.Model):
    """Catálogo de productos (tabla productos)."""

    ESTADO_CHOICES = [
        ('disponible', 'Disponible'),
        ('no_disponible', 'No disponible'),
    ]

    nombre = models.CharField(max_length=200)
    descripcion = models.TextField(blank=True, null=True)
    precio = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    existencias = models.PositiveIntegerField(default=0)
    estado = models.CharField(max_length=15, choices=ESTADO_CHOICES, default='disponible')
    categoria = models.ForeignKey(
        Categoria, on_delete=models.PROTECT, related_name='productos', db_column='categoria_id'
    )
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'productos'
        ordering = ['-fecha_creacion']

    def __str__(self):
        return self.nombre

    @property
    def inventario_bajo(self):
        return self.existencias < 5


class Cliente(models.Model):
    """Clientes registrados (tabla clientes)."""

    nombre_completo = models.CharField(max_length=200)
    telefono = models.CharField(max_length=20, blank=True, null=True)
    correo = models.EmailField(blank=True, null=True)
    fecha_registro = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'clientes'
        ordering = ['-fecha_registro']

    def __str__(self):
        return self.nombre_completo

    @property
    def numero_pedidos(self):
        return self.pedidos.count()

    @property
    def dinero_total_gastado(self):
        total = self.pedidos.filter(estado='entregado').aggregate(
            suma=models.Sum('total')
        )['suma']
        return total or 0


class Pedido(models.Model):
    """Pedidos realizados por los clientes (tabla pedidos)."""

    METODO_PAGO_CHOICES = [
        ('efectivo', 'Efectivo'),
        ('tarjeta', 'Tarjeta'),
        ('transferencia', 'Transferencia'),
    ]
    ESTADO_CHOICES = [
        ('pendiente', 'Pendiente'),
        ('en_preparacion', 'En preparación'),
        ('listo', 'Listo'),
        ('entregado', 'Entregado'),
        ('cancelado', 'Cancelado'),
    ]

    cliente = models.ForeignKey(Cliente, on_delete=models.PROTECT, related_name='pedidos', db_column='cliente_id')
    metodo_pago = models.CharField(max_length=20, choices=METODO_PAGO_CHOICES, default='efectivo')
    total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='pendiente')
    notas = models.TextField(blank=True, null=True)
    fecha = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'pedidos'
        ordering = ['-fecha']

    def __str__(self):
        return f'Pedido #{self.id} - {self.cliente.nombre_completo}'

    @property
    def numero_total_unidades(self):
        return sum(item.cantidad for item in self.detalles.all())

    def calcular_total(self):
        total = sum(item.subtotal for item in self.detalles.all())
        self.total = total
        self.save(update_fields=['total'])
        return total
    ESTADOS_QUE_DESCUENTAN = ['en_preparacion', 'listo', 'entregado']

    def aplicar_movimiento_inventario(self, estado_anterior, estado_nuevo):
        """
        Ajusta el inventario según el cambio de estado:
        - Al entrar a un estado que descuenta (y no venía de otro que ya descontaba): resta.
        - Al pasar a 'cancelado' desde un estado que ya había descontado: regresa el inventario.
        - Al pasar de un estado que descuenta a 'pendiente' (poco común, pero por seguridad): regresa.
        """
        ya_descontaba = estado_anterior in self.ESTADOS_QUE_DESCUENTAN
        debe_descontar = estado_nuevo in self.ESTADOS_QUE_DESCUENTAN

        if not ya_descontaba and debe_descontar:
            for detalle in self.detalles.all():
                detalle.producto.existencias -= detalle.cantidad
                detalle.producto.save(update_fields=['existencias'])

        elif ya_descontaba and not debe_descontar:
            for detalle in self.detalles.all():
                detalle.producto.existencias += detalle.cantidad
                detalle.producto.save(update_fields=['existencias'])

class DetallePedido(models.Model):
    """Líneas de producto dentro de un pedido (tabla detalle_pedido)."""

    pedido = models.ForeignKey(Pedido, on_delete=models.CASCADE, related_name='detalles', db_column='pedido_id')
    producto = models.ForeignKey(Producto, on_delete=models.PROTECT, related_name='detalles', db_column='producto_id')
    cantidad = models.PositiveIntegerField(validators=[MinValueValidator(1)])
    precio_unitario = models.DecimalField(max_digits=10, decimal_places=2)
    subtotal = models.DecimalField(max_digits=12, decimal_places=2)

    class Meta:
        db_table = 'detalle_pedido'

    def __str__(self):
        return f'{self.producto.nombre} x{self.cantidad}'

    def save(self, *args, **kwargs):
        if not self.precio_unitario:
            self.precio_unitario = self.producto.precio
        self.subtotal = self.precio_unitario * self.cantidad
        super().save(*args, **kwargs)